/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as orderService from '@/services/order.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/order.service', () => ({
  trackOrder: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

describe('GET /api/v1/orders/track', () => {
  const mockTrackOrder = orderService.trackOrder as jest.MockedFunction<typeof orderService.trackOrder>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(null);
  });

  it('should return 429 if rate limited', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    mockWithRateLimit.mockResolvedValue(rateLimitResponse as any);

    const req = new NextRequest('http://localhost:3000/api/v1/orders/track?order_number=NF-123&phone_number=08012345678', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(429);
  });

  it('should return 400 if parameters are invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/orders/track?order_number=&phone_number=', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid parameters');
  });

  it('should return 404 if order not found', async () => {
    mockTrackOrder.mockRejectedValue(new Error('Order not found'));

    const req = new NextRequest('http://localhost:3000/api/v1/orders/track?order_number=NF-123&phone_number=08012345678', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Order not found');
  });

  it('should return 200 with order on success', async () => {
    const mockOrder = {
      id: 'order-1',
      order_number: 'NF-123',
      customer_name: 'John Doe',
      order_status: 'pending',
      items: [],
    };
    mockTrackOrder.mockResolvedValue(mockOrder);

    const req = new NextRequest('http://localhost:3000/api/v1/orders/track?order_number=NF-123&phone_number=08012345678', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockOrder);
  });
});
