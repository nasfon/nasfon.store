/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST as loginPOST } from '@/app/api/v1/auth/login/route';
import { POST as checkoutPOST } from '@/app/api/v1/checkout/route';
import { GET as adminProductsGET } from '@/app/api/v1/admin/products/route';
import { POST as adminProductsPOST } from '@/app/api/v1/admin/products/route';
import * as authService from '@/services/auth.service';
import * as checkoutService from '@/services/checkout.service';
import * as productsService from '@/services/admin/products.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
}));

jest.mock('@/services/checkout.service', () => ({
  createCheckout: jest.fn(),
}));

jest.mock('@/services/admin/products.service', () => ({
  getAdminProducts: jest.fn(),
  createProduct: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
    getAuthUser: jest.fn(),
    requireUser: jest.fn(),
    requireAdmin: jest.fn(),
  };
});

function mockRateLimitNotReached() {
  (apiLib.withRateLimit as jest.Mock).mockResolvedValue(null);
}

describe('Authentication & Authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitNotReached();
  });

  it('should reject unauthenticated users from admin routes', async () => {
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const res = await adminProductsGET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should reject non-admin users from admin routes with 403', async () => {
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Forbidden: admin role required' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const res = await adminProductsGET();
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe('Forbidden: admin role required');
  });

  it('should reject unauthenticated users from customer protected routes', async () => {
    (apiLib.requireUser as jest.Mock).mockResolvedValue({
      user: null,
      error: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      }) as any,
    });

    const { GET: ordersGET } = await import('@/app/api/v1/orders/route');
    const res = await ordersGET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitNotReached();
    (authService.login as jest.Mock).mockResolvedValue({} as any);
    (apiLib.getAuthUser as jest.Mock).mockResolvedValue({ id: 'user-1' } as any);
  });

  it('should return 429 when rate limited on auth endpoint', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    (apiLib.withRateLimit as jest.Mock).mockResolvedValue(rateLimitResponse as any);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
    });

    const res = await loginPOST(req);
    expect(res.status).toBe(429);
  });

  it('should apply rate limiting to checkout endpoint', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    (apiLib.withRateLimit as jest.Mock).mockResolvedValue(rateLimitResponse as any);

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'John', customer_email: 'j@t.com',
        customer_phone: '08012345678', delivery_location_id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const res = await checkoutPOST(req);
    expect(res.status).toBe(429);
  });
});

describe('Input Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitNotReached();
  });

  it('should reject invalid email formats in login', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
    });

    const res = await loginPOST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should reject empty login fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' }),
    });

    const res = await loginPOST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should reject checkout with missing required fields', async () => {
    (apiLib.getAuthUser as jest.Mock).mockResolvedValue({ id: 'user-1' } as any);

    const req = new NextRequest('http://localhost:3000/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify({ customer_name: 'John' }),
    });

    const res = await checkoutPOST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Validation failed');
  });

  it('should reject empty required fields', async () => {
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });

    const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        slug: '',
        sku: '',
        selling_price: -1,
      }),
    });

    const res = await adminProductsPOST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
