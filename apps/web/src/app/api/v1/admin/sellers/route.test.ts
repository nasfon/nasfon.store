/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as sellersService from '@/services/admin/sellers.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/sellers.service', () => ({
  adminGetSellers: jest.fn(),
  adminCreateSeller: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const VALID_SELLER = {
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'password123',
  shop_name: "Jane's Boutique",
  shop_slug: 'janes-boutique',
  shop_address: '12 Lagos Road, Ikeja, Lagos',
  contact_phone: '08012345678',
  contact_email: 'jane@example.com',
};

describe('GET /api/v1/admin/sellers', () => {
  const mockGetSellers = sellersService.adminGetSellers as jest.MockedFunction<typeof sellersService.adminGetSellers>;
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

    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 with sellers', async () => {
    const mockSellers = [{ id: 's1', shop_name: 'Shop 1' }];
    mockGetSellers.mockResolvedValue(mockSellers);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers?status=approved');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSellers);
    expect(mockGetSellers).toHaveBeenCalledWith({ status: 'approved', search: undefined });
  });
});

describe('POST /api/v1/admin/sellers', () => {
  const mockCreateSeller = sellersService.adminCreateSeller as jest.MockedFunction<typeof sellersService.adminCreateSeller>;
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

    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers', {
      method: 'POST', body: JSON.stringify(VALID_SELLER),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if required fields are missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers', {
      method: 'POST', body: JSON.stringify({ shop_name: 'Only Shop' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(mockCreateSeller).not.toHaveBeenCalled();
  });

  it('should return 201 on successful creation', async () => {
    const mockSeller = { id: 's1', ...VALID_SELLER, verification_status: 'approved' };
    mockCreateSeller.mockResolvedValue(mockSeller);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers', {
      method: 'POST', body: JSON.stringify(VALID_SELLER),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockSeller);
    expect(data.message).toBe('Seller created');
  });

  it('should return 400 if service fails', async () => {
    mockCreateSeller.mockRejectedValue(new Error('An account with this email already exists'));

    const req = new NextRequest('http://localhost:3000/api/v1/admin/sellers', {
      method: 'POST', body: JSON.stringify(VALID_SELLER),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('An account with this email already exists');
  });
});
