/**
 * @jest-environment node
 */
import { GET } from './route';
import * as orderService from '@/services/order.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/order.service', () => ({
  getCustomerOrders: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireUser: jest.fn(),
  };
});

describe('GET /api/v1/orders', () => {
  const mockGetCustomerOrders = orderService.getCustomerOrders as jest.MockedFunction<typeof orderService.getCustomerOrders>;
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

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 200 with orders', async () => {
    const mockOrders = [
      { id: 'order-1', order_number: 'NF-001', order_status: 'pending', items: [] },
      { id: 'order-2', order_number: 'NF-002', order_status: 'delivered', items: [] },
    ];
    mockGetCustomerOrders.mockResolvedValue(mockOrders);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockOrders);
  });

  it('should return 500 if service fails', async () => {
    mockGetCustomerOrders.mockRejectedValue(new Error('Failed to fetch orders'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch orders');
  });
});
