/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as customersService from '@/services/admin/customers.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/customers.service', () => ({
  getAdminCustomers: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

describe('GET /api/v1/admin/customers', () => {
  const mockGetAdminCustomers = customersService.getAdminCustomers as jest.MockedFunction<typeof customersService.getAdminCustomers>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 with customers', async () => {
    const mockCustomers = [{ id: 'u1', full_name: 'John Doe' }];
    mockGetAdminCustomers.mockResolvedValue(mockCustomers);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCustomers);
  });

  it('should return 500 if service fails', async () => {
    mockGetAdminCustomers.mockRejectedValue(new Error('Failed to fetch customers'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch customers');
  });
});
