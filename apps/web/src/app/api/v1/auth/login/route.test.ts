/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as authService from '@/services/auth.service';
import * as apiLib from '@/lib/api';

// Mock the dependencies
jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('POST /api/v1/auth/login', () => {
  const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior for rate limiting: allow request
    mockWithRateLimit.mockResolvedValue(null);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: '' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
    expect(data.errors).toBeDefined();
  });

  it('should return 401 if login service throws an error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid credentials');
  });

  it('should return 200 and auth data on successful login', async () => {
    const mockResult = {
      session: { access_token: '123' },
      user: { id: 'user-1', email: 'test@example.com' },
      role: 'customer' as const,
    };
    // @ts-ignore
    mockLogin.mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(data.data).toEqual(mockResult);
  });

  it('should return 429 if rate limited', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    mockWithRateLimit.mockResolvedValue(rateLimitResponse);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
