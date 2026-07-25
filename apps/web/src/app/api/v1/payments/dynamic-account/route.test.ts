/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as flutterwaveService from '@/services/flutterwave';
import * as apiLib from '@/lib/api';

jest.mock('@/services/flutterwave', () => ({
  createVirtualAccount: jest.fn(),
  findOrCreateCustomer: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    withRateLimit: jest.fn(),
  };
});

const VALID_BODY = {
  amount: 5000,
  email: 'john@example.com',
  fullname: 'John Doe',
  phonenumber: '08012345678',
};

describe('POST /api/v1/payments/dynamic-account', () => {
  const mockCreateVirtualAccount = flutterwaveService.createVirtualAccount as jest.MockedFunction<typeof flutterwaveService.createVirtualAccount>;
  const mockFindOrCreateCustomer = flutterwaveService.findOrCreateCustomer as jest.MockedFunction<typeof flutterwaveService.findOrCreateCustomer>;
  const mockWithRateLimit = apiLib.withRateLimit as jest.MockedFunction<typeof apiLib.withRateLimit>;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(null);
    mockFindOrCreateCustomer.mockResolvedValue('cust-1');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 429 if rate limited', async () => {
    const rateLimitResponse = new Response(JSON.stringify({ success: false, message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    mockWithRateLimit.mockResolvedValue(rateLimitResponse as any);

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('should return 503 if Flutterwave credentials are not configured', async () => {
    process.env = { ...originalEnv };
    delete process.env.FLUTTERWAVE_CLIENT_ID;
    delete process.env.FLUTTERWAVE_CLIENT_SECRET;

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.message).toBe('Payment not configured');
  });

  it('should return 400 if amount or email is missing', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Amount and email are required');
  });

  it('should return 200 on successful account generation', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';

    mockCreateVirtualAccount.mockResolvedValue({
      id: 'va-1',
      account_number: '1234567890',
      account_bank_name: 'GTBank',
      account_name: 'John Doe',
      account_expiration_datetime: new Date(Date.now() + 3600000).toISOString(),
      reference: 'NF-REF',
      customer_id: 'cust-1',
      amount: 5000,
      status: 'active',
      note: '',
    });

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.bank_name).toBe('GTBank');
    expect(data.data.account_number).toBe('1234567890');
  });

  it('should return 500 if flutterwave service fails', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';

    mockCreateVirtualAccount.mockRejectedValue(new Error('API error'));

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('API error');
  });

  it('should return 500 if customer creation fails', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';

    mockFindOrCreateCustomer.mockRejectedValue(new Error('Customer error'));

    const req = new NextRequest('http://localhost:3000/api/v1/payments/dynamic-account', {
      method: 'POST',
      body: JSON.stringify(VALID_BODY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Customer error');
  });
});
