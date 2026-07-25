/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as orderService from '@/services/order.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/order.service', () => ({
  getOrderById: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireUser: jest.fn(),
  };
});

const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/orders/[id]', () => {
  const mockGetOrderById = orderService.getOrderById as jest.MockedFunction<typeof orderService.getOrderById>;
  const mockRequireUser = apiLib.requireUser as jest.MockedFunction<typeof apiLib.requireUser>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireUser.mockResolvedValue({ user: { id: 'user-1' } as any, error: null });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockRequireUser.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/orders/${ORDER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: ORDER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 404 if order not found', async () => {
    mockGetOrderById.mockRejectedValue(new Error('Order not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/orders/${ORDER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: ORDER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe('Order not found');
  });

  it('should return 200 with order on success', async () => {
    const mockOrder = {
      id: ORDER_ID,
      order_number: 'NF-001',
      order_status: 'payment_confirmed',
      items: [],
    };
    mockGetOrderById.mockResolvedValue(mockOrder);

    const req = new NextRequest(`http://localhost:3000/api/v1/orders/${ORDER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: ORDER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockOrder);
  });
});
