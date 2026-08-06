/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/utils/supabase/middleware', () => ({
  createClient: jest.fn(() => ({
    supabase: { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) } },
    supabaseResponse: new NextResponse(),
  })),
}));

import { middleware } from '@/middleware';

const ORIGINAL_APP_URL = process.env.APP_URL;

describe('proxy middleware', () => {
  beforeEach(() => {
    process.env.APP_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env.APP_URL = ORIGINAL_APP_URL;
  });

  describe('CORS', () => {
    it('should return 204 with CORS headers for OPTIONS preflight on API routes', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/products', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });

      const res = await middleware(req);

      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should reject CORS from disallowed origins', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/products', {
        method: 'OPTIONS',
        headers: { origin: 'https://evil.com' },
      });

      const res = await middleware(req);

      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });

  describe('CSRF protection', () => {
    it('should block state-changing requests without X-Requested-With header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await middleware(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.message).toBe('CSRF validation failed');
    });

    it('should block requests with mismatched origin', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Origin: 'https://evil.com',
        },
        body: JSON.stringify({}),
      });

      const res = await middleware(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.message).toBe('Invalid origin');
    });

    it('should not apply CSRF to GET requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/products', {
        method: 'GET',
      });

      const res = await middleware(req);
      expect(res.status).not.toBe(403);
    });

    it('should exempt Flutterwave webhook from CSRF', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await middleware(req);
      expect(res.status).not.toBe(403);
    });

    it('should exempt Paystack webhook from CSRF', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/paystack', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await middleware(req);
      expect(res.status).not.toBe(403);
    });
  });
});
