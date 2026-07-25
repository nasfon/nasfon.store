/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as ordersService from '@/services/admin/orders.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/orders.service', () => ({
  getAdminOrderById: jest.fn(),
  updateOrder: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/admin/orders/[id]', () => {
  const mockGetAdminOrderById = ordersService.getAdminOrderById as jest.MockedFunction<typeof ordersService.getAdminOrderById>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 200 with order', async () => {
    const mockOrder = { id: ORDER_ID, order_number: 'NF-001', order_status: 'pending' };
    mockGetAdminOrderById.mockResolvedValue(mockOrder);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/orders/${ORDER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: ORDER_ID }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual(mockOrder);
  });

  it('should return 404 if not found', async () => {
    mockGetAdminOrderById.mockRejectedValue(new Error('Order not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/orders/${ORDER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: ORDER_ID }) });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/admin/orders/[id]', () => {
  const mockUpdateOrder = ordersService.updateOrder as jest.MockedFunction<typeof ordersService.updateOrder>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/admin/orders/${ORDER_ID}`, {
      method: 'PATCH', body: JSON.stringify({ order_status: 'invalid' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: ORDER_ID }) });
    expect(res.status).toBe(400);
  });

  it('should return 200 on successful update', async () => {
    const mockOrder = { id: ORDER_ID, order_status: 'processing' };
    mockUpdateOrder.mockResolvedValue(mockOrder);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/orders/${ORDER_ID}`, {
      method: 'PATCH', body: JSON.stringify({ order_status: 'processing' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: ORDER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockOrder);
    expect(data.message).toBe('Order updated');
  });
});
