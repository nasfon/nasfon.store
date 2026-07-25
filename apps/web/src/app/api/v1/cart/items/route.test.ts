/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  addCartItem: jest.fn(),
}));

describe('POST /api/v1/cart/items', () => {
  const mockAddCartItem = cartService.addCartItem as jest.MockedFunction<typeof cartService.addCartItem>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: 'invalid', quantity: 0 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Validation failed');
  });

  it('should return 400 if service throws an error', async () => {
    mockAddCartItem.mockRejectedValue(new Error('Product not found'));

    const req = new NextRequest('http://localhost:3000/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Product not found');
  });

  it('should return 200 and add item on success', async () => {
    const mockResult = { items: [{ product_id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, added_at: new Date().toISOString() }] };
    mockAddCartItem.mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost:3000/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(data.message).toBe('Item added to cart');
  });
});
