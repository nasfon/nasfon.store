/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, DELETE } from './route';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  getCartWithProducts: jest.fn(),
  clearCart: jest.fn(),
}));

describe('GET /api/v1/cart', () => {
  const mockGetCartWithProducts = cartService.getCartWithProducts as jest.MockedFunction<typeof cartService.getCartWithProducts>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with cart items', async () => {
    const mockCart = {
      items: [{ product_id: 'p1', quantity: 2, product: { name: 'Test', slug: 'test', selling_price: 100, featured_image: null, stock_quantity: 10, compare_price: null }, subtotal: 200 }],
      total: 200,
    };
    mockGetCartWithProducts.mockResolvedValue(mockCart);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockCart);
  });

  it('should return 500 if service fails', async () => {
    mockGetCartWithProducts.mockRejectedValue(new Error('Failed to fetch cart'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to fetch cart');
  });
});

describe('DELETE /api/v1/cart', () => {
  const mockClearCart = cartService.clearCart as jest.MockedFunction<typeof cartService.clearCart>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 on clearing cart', async () => {
    mockClearCart.mockResolvedValue(undefined);

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Cart cleared');
  });

  it('should return 500 if service fails', async () => {
    mockClearCart.mockRejectedValue(new Error('Failed to clear cart'));

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to clear cart');
  });
});
