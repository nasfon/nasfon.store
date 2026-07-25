/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from './route';
import * as productsService from '@/services/admin/products.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/products.service', () => ({
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('PATCH /api/v1/admin/products/[id]', () => {
  const mockUpdateProduct = productsService.updateProduct as jest.MockedFunction<typeof productsService.updateProduct>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/admin/products/${PRODUCT_ID}`, {
      method: 'PATCH', body: JSON.stringify({ selling_price: -1 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: PRODUCT_ID }) });
    expect(res.status).toBe(400);
  });

  it('should return 200 on successful update', async () => {
    const mockProduct = { id: PRODUCT_ID, name: 'Updated', selling_price: 6000 };
    mockUpdateProduct.mockResolvedValue(mockProduct);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/products/${PRODUCT_ID}`, {
      method: 'PATCH', body: JSON.stringify({ selling_price: 6000 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: PRODUCT_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProduct);
    expect(data.message).toBe('Product updated');
  });
});

describe('DELETE /api/v1/admin/products/[id]', () => {
  const mockDeleteProduct = productsService.deleteProduct as jest.MockedFunction<typeof productsService.deleteProduct>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 on successful deletion', async () => {
    mockDeleteProduct.mockResolvedValue(undefined);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/products/${PRODUCT_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: PRODUCT_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Product deleted');
  });
});
