/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as productService from '@/services/product.service';

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
}));

describe('GET /api/v1/products', () => {
  const mockGetProducts = productService.getProducts as jest.MockedFunction<typeof productService.getProducts>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails', async () => {
    // Send invalid sort parameter
    const req = new NextRequest('http://localhost:3000/api/v1/products?sort=invalid', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid query parameters');
  });

  it('should return 500 if service throws an error', async () => {
    mockGetProducts.mockRejectedValue(new Error('Database error'));

    const req = new NextRequest('http://localhost:3000/api/v1/products', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Database error');
  });

  it('should return 200 with products on success', async () => {
    const mockResult = {
      data: [{ id: 'p1', name: 'Product 1' }],
      metadata: { total: 1, page: 1, limit: 20 },
    };
    mockGetProducts.mockResolvedValue(mockResult as any);

    const req = new NextRequest('http://localhost:3000/api/v1/products?page=1&limit=20', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=300');
  });
});
