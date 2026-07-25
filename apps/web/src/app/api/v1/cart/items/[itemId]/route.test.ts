/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from './route';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
}));

const ITEM_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('PATCH /api/v1/cart/items/[itemId]', () => {
  const mockUpdateCartItem = cartService.updateCartItem as jest.MockedFunction<typeof cartService.updateCartItem>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/cart/items/${ITEM_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: -1 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ itemId: ITEM_ID }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 if service throws an error', async () => {
    mockUpdateCartItem.mockRejectedValue(new Error('Item not found in cart'));

    const req = new NextRequest(`http://localhost:3000/api/v1/cart/items/${ITEM_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 3 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ itemId: ITEM_ID }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Item not found in cart');
  });

  it('should return 200 on successful update', async () => {
    const mockResult = { items: [{ product_id: ITEM_ID, quantity: 3, added_at: new Date().toISOString() }] };
    mockUpdateCartItem.mockResolvedValue(mockResult);

    const req = new NextRequest(`http://localhost:3000/api/v1/cart/items/${ITEM_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 3 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ itemId: ITEM_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(data.message).toBe('Cart updated');
  });
});

describe('DELETE /api/v1/cart/items/[itemId]', () => {
  const mockRemoveCartItem = cartService.removeCartItem as jest.MockedFunction<typeof cartService.removeCartItem>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 on successful removal', async () => {
    const mockResult = { items: [] };
    mockRemoveCartItem.mockResolvedValue(mockResult);

    const req = new NextRequest(`http://localhost:3000/api/v1/cart/items/${ITEM_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ itemId: ITEM_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
    expect(data.message).toBe('Item removed from cart');
  });

  it('should return 400 if service throws an error', async () => {
    mockRemoveCartItem.mockRejectedValue(new Error('Failed to remove item'));

    const req = new NextRequest(`http://localhost:3000/api/v1/cart/items/${ITEM_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ itemId: ITEM_ID }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to remove item');
  });
});
