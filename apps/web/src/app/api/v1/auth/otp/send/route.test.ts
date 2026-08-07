/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as otpService from '@/services/otp.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/otp.service', () => ({
  createAndSendOtp: jest.fn(),
  findUserByEmail: jest.fn(),
  resendPendingOtp: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('POST /api/v1/auth/otp/send', () => {
  const mockSend = otpService.createAndSendOtp as jest.MockedFunction<typeof otpService.createAndSendOtp>;
  const mockFind = otpService.findUserByEmail as jest.MockedFunction<typeof otpService.findUserByEmail>;
  const mockResend = otpService.resendPendingOtp as jest.MockedFunction<typeof otpService.resendPendingOtp>;
  const mockRate = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRate.mockResolvedValue(null);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'bad' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should reject resending signup code when email already verified', async () => {
    mockFind.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      email_verified_at: '2026-01-01T00:00:00Z',
      is_active: true,
    });
    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Email is already verified');
  });

  it('should reject resending signup code when an account already exists', async () => {
    mockFind.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      email_verified_at: null,
      is_active: true,
    });
    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('An account with this email already exists');
  });

  it('should resend a signup code for a pending registration', async () => {
    mockFind.mockResolvedValue(null);
    mockResend.mockResolvedValue(true);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockResend).toHaveBeenCalledWith('test@example.com');
  });

  it('should return 400 when no pending registration exists', async () => {
    mockFind.mockResolvedValue(null);
    mockResend.mockResolvedValue(false);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'signup', email: 'test@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('No pending registration found for this email. Please register first.');
  });

  it('should send a login code for an existing verified user', async () => {
    mockFind.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      email_verified_at: '2026-01-01T00:00:00Z',
      is_active: true,
    });
    mockSend.mockResolvedValue({ expiresAt: '2100-01-01T00:00:00Z' });

    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'login', email: 'test@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'test@example.com',
      purpose: 'login',
    });
  });

  it('should reject login code for unknown user', async () => {
    mockFind.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ purpose: 'login', email: 'nobody@example.com' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid email address');
  });
});