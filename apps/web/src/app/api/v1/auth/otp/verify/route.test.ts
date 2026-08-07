/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as otpService from '@/services/otp.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/otp.service', () => ({
  findUserByEmail: jest.fn(),
  verifyOtp: jest.fn(),
  verifyAndCompleteSignup: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('POST /api/v1/auth/otp/verify', () => {
  const mockFind = otpService.findUserByEmail as jest.MockedFunction<typeof otpService.findUserByEmail>;
  const mockVerify = otpService.verifyOtp as jest.MockedFunction<typeof otpService.verifyOtp>;
  const mockComplete = otpService.verifyAndCompleteSignup as jest.MockedFunction<typeof otpService.verifyAndCompleteSignup>;
  const mockRate = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRate.mockResolvedValue(null);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com', code: 'ab' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should complete a signup and create the account', async () => {
    // @ts-expect-error - mock return type mismatch (User shape)
    mockComplete.mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com', code: '123456' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully');
    expect(mockComplete).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
    });
  });

  it('should propagate a signup completion error', async () => {
    mockComplete.mockRejectedValue(new Error('Invalid or expired verification code'));

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com', code: '123456' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid or expired verification code');
  });

  it('should reject invalid login code', async () => {
    mockFind.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      email_verified_at: '2026-01-01T00:00:00Z',
      is_active: true,
    });
    mockVerify.mockResolvedValue(false);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'login', email: 'test@example.com', code: '123456' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid or expired verification code');
  });

  it('should verify a login code', async () => {
    mockFind.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      email_verified_at: '2026-01-01T00:00:00Z',
      is_active: true,
    });
    mockVerify.mockResolvedValue(true);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'login', email: 'test@example.com', code: '123456' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.message).toBe('Verification successful');
    expect(mockVerify).toHaveBeenCalledWith({
      userId: 'user-1',
      code: '123456',
      purpose: 'login',
    });
  });
});