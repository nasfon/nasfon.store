/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as productsService from '@/services/admin/products.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/products.service', () => ({
  getAdminProducts: jest.fn(),
  createProduct: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const VALID_PRODUCT = {
  category_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Product',
  slug: 'test-product',
  sku: 'TP-001',
  selling_price: 5000,
  stock_quantity: 10,
};

describe('GET /api/v1/admin/products', () => {
  const mockGetAdminProducts = productsService.getAdminProducts as jest.MockedFunction<typeof productsService.getAdminProducts>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 401 if not authenticated', async () => {
    mockRequireAdmin.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 200 with products', async () => {
    const mockProducts = [{ id: 'p1', name: 'Product 1' }];
    mockGetAdminProducts.mockResolvedValue(mockProducts);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProducts);
  });

  it('should return 500 if service fails', async () => {
    mockGetAdminProducts.mockRejectedValue(new Error('Failed to fetch products'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch products');
  });
});

describe('POST /api/v1/admin/products', () => {
  const mockCreateProduct = productsService.createProduct as jest.MockedFunction<typeof productsService.createProduct>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 401 if not authenticated', async () => {
    mockRequireAdmin.mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST', body: JSON.stringify(VALID_PRODUCT),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST', body: JSON.stringify({ name: 'P' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should return 201 on successful creation', async () => {
    const mockProduct = { id: 'p1', ...VALID_PRODUCT };
    mockCreateProduct.mockResolvedValue(mockProduct);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST', body: JSON.stringify(VALID_PRODUCT),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProduct);
    expect(data.message).toBe('Product created');
  });
});
