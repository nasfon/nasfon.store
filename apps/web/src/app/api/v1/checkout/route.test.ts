/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as checkoutService from '@/services/checkout.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/checkout.service', () => ({
  createCheckout: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
    getAuthUser: jest.fn(),
  };
});

const VALID_BODY = {
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '08012345678',
  delivery_location_id: '550e8400-e29b-41d4-a716-446655440000',
};

describe('POST /api/v1/checkout', () => {
  const mockCreateCheckout = checkoutService.createCheckout as jest.MockedFunction<typeof checkoutService.createCheckout>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;
  const mockGetAuthUser = apiLib.getAuthUser as jest.MockedFunction<typeof apiLib.getAuthUser>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(null);
    mockGetAuthUser.mockResolvedValue({ id: 'user-1', email: 'john@example.com' } as any);
  });

  it('should return 429 if rate limited', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    mockWithRateLimit.mockResolvedValue(rateLimitResponse as any);

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify({ customer_name: 'J' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  it('should return 400 if service throws an error', async () => {
    mockCreateCheckout.mockRejectedValue(new Error('Cart is empty'));

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Cart is empty');
  });

  it('should return 201 on successful checkout', async () => {
    const mockResult = {
      payment: {
        id: 'pay-1',
        reference: 'NF-ABC123',
        amount: 5500,
        payment_status: 'pending',
        payment_url: 'https://checkout.paystack.com/test-access-code',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
    };
    mockCreateCheckout.mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(data.message).toBe('Payment initiated');
  });

  it('should pass user_id as null if not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);
    mockCreateCheckout.mockResolvedValue({ payment: {} as any });

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    await POST(req);

    expect(mockCreateCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null })
    );
  });
});
