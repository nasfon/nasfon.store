/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from './route';
import * as customersService from '@/services/admin/customers.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/customers.service', () => ({
  getAdminCustomerById: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const CUSTOMER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/admin/customers/[id]', () => {
  const mockGetAdminCustomerById = customersService.getAdminCustomerById as jest.MockedFunction<typeof customersService.getAdminCustomerById>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 200 with customer', async () => {
    const mockCustomer = { id: CUSTOMER_ID, full_name: 'John Doe' };
    mockGetAdminCustomerById.mockResolvedValue(mockCustomer);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/customers/${CUSTOMER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: CUSTOMER_ID }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual(mockCustomer);
  });

  it('should return 404 if not found', async () => {
    mockGetAdminCustomerById.mockRejectedValue(new Error('Customer not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/customers/${CUSTOMER_ID}`, { method: 'GET' });
    const res = await GET(req, { params: Promise.resolve({ id: CUSTOMER_ID }) });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/admin/customers/[id]', () => {
  const mockUpdateCustomer = customersService.updateCustomer as jest.MockedFunction<typeof customersService.updateCustomer>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 200 on successful update', async () => {
    const mockCustomer = { id: CUSTOMER_ID, full_name: 'Updated Name' };
    mockUpdateCustomer.mockResolvedValue(mockCustomer);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/customers/${CUSTOMER_ID}`, {
      method: 'PATCH', body: JSON.stringify({ full_name: 'Updated Name' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: CUSTOMER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCustomer);
    expect(data.message).toBe('Customer updated');
  });
});

describe('DELETE /api/v1/admin/customers/[id]', () => {
  const mockDeleteCustomer = customersService.deleteCustomer as jest.MockedFunction<typeof customersService.deleteCustomer>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 200 on successful deletion', async () => {
    mockDeleteCustomer.mockResolvedValue(undefined);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/customers/${CUSTOMER_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: CUSTOMER_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Customer deleted');
  });
});
