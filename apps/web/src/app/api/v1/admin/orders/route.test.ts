/**
 * @jest-environment node
 */
import { GET } from './route';
import * as ordersService from '@/services/admin/orders.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/orders.service', () => ({
  getAdminOrders: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

describe('GET /api/v1/admin/orders', () => {
  const mockGetAdminOrders = ordersService.getAdminOrders as jest.MockedFunction<typeof ordersService.getAdminOrders>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 401 if not authenticated', async () => {
    mockRequireAdmin.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('should return 200 with orders', async () => {
    const mockOrders = [{ id: 'o1', order_number: 'NF-001' }];
    mockGetAdminOrders.mockResolvedValue(mockOrders);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockOrders);
  });

  it('should return 500 if service fails', async () => {
    mockGetAdminOrders.mockRejectedValue(new Error('Failed to fetch orders'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch orders');
  });
});
