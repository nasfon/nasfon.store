/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as dashboardService from '@/services/admin/dashboard.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/dashboard.service', () => ({
  getDashboard: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

describe('GET /api/v1/admin/dashboard', () => {
  const mockGetDashboard = dashboardService.getDashboard as jest.MockedFunction<typeof dashboardService.getDashboard>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 with dashboard data', async () => {
    const mockDashboard = {
      stats: { total_orders: 100, total_revenue: 500000 },
      low_stock_products: [],
      recent_orders: [],
    };
    mockGetDashboard.mockResolvedValue(mockDashboard);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockDashboard);
  });

  it('should return 500 if service fails', async () => {
    mockGetDashboard.mockRejectedValue(new Error('Failed to fetch dashboard'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch dashboard');
  });
});
