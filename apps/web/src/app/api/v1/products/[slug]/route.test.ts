/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as productService from '@/services/product.service';

jest.mock('@/services/product.service', () => ({
  getProductBySlug: jest.fn(),
}));

describe('GET /api/v1/products/[slug]', () => {
  const mockGetProductBySlug = productService.getProductBySlug as jest.MockedFunction<typeof productService.getProductBySlug>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if product is not found', async () => {
    mockGetProductBySlug.mockRejectedValue(new Error('Product not found'));

    const req = new NextRequest('http://localhost:3000/api/v1/products/unknown-slug', {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ slug: 'unknown-slug' }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Product not found');
  });

  it('should return 200 with product details on success', async () => {
    const mockProduct = { id: 'p1', name: 'Test Product', slug: 'test-product' };
    mockGetProductBySlug.mockResolvedValue(mockProduct as any);

    const req = new NextRequest('http://localhost:3000/api/v1/products/test-product', {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ slug: 'test-product' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProduct);
  });
});
