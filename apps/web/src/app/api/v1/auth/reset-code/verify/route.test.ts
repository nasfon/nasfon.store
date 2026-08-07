/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as passwordResetService from '@/services/passwordReset.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/passwordReset.service', () => ({
  verifyResetCode: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('POST /api/v1/auth/reset-code/verify', () => {
  const mockVerify = passwordResetService.verifyResetCode as jest.MockedFunction<typeof passwordResetService.verifyResetCode>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  const validBody = { email: 'test@example.com', code: '123456' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(null);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/reset-code/verify', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', code: '12' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  it('should return 400 if the code is invalid or expired', async () => {
    mockVerify.mockRejectedValue(new Error('Invalid or expired reset code. Please request a new one.'));

    const req = new NextRequest('http://localhost:3000/api/v1/auth/reset-code/verify', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid or expired reset code. Please request a new one.');
  });

  it('should return 200 when the code is verified', async () => {
    mockVerify.mockResolvedValue();

    const req = new NextRequest('http://localhost:3000/api/v1/auth/reset-code/verify', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Code verified');
    expect(mockVerify).toHaveBeenCalledWith(validBody);
  });
});