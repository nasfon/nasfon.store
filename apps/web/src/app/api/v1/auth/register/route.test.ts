/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as authService from '@/services/auth.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/auth.service', () => ({
  register: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('POST /api/v1/auth/register', () => {
  const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(null);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', password: 'pass', full_name: 'J' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  it('should return 400 if registration service throws an error', async () => {
    mockRegister.mockRejectedValue(new Error('Email already taken'));

    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', full_name: 'Test User' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Email already taken');
  });

  it('should return 201 on successful registration', async () => {
    const mockResult = { user: { id: 'user-1', email: 'test@example.com' } };
    // @ts-expect-error - mock return type mismatch
    mockRegister.mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', full_name: 'Test User' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully');
    expect(data.data).toEqual(mockResult);
  });
});
