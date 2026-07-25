/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as paymentService from '@/services/payment.service';
import { createAdminClient } from '@/utils/supabase/admin';

jest.mock('@/services/payment.service', () => ({
  confirmPaymentFromFlutterwave: jest.fn(),
}));

jest.mock('@/utils/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}));

const mockCreateAdminClient = jest.mocked(createAdminClient);

function makeSupabaseMock() {
  const updateEqFn = jest.fn(() => Promise.resolve({ error: null }));
  const updateFn = jest.fn(() => ({ eq: updateEqFn }));
  const singleFn = jest.fn().mockResolvedValue({ data: null, error: null });
  const eqFn = jest.fn(() => ({
    single: singleFn,
    maybeSingle: singleFn,
  }));
  const selectFn = jest.fn(() => ({ eq: eqFn }));
  const insertFn = jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) }));
  const deleteFn = jest.fn(() => ({ eq: eqFn }));
  const orderFn = jest.fn(() => ({ limit: jest.fn() }));
  const fromFn = jest.fn(() => ({ select: selectFn, update: updateFn, insert: insertFn, delete: deleteFn, order: orderFn }));
  return { from: fromFn };
}

function makeSupabaseMockWithPayment(paymentData: any) {
  const updateEqFn = jest.fn(() => Promise.resolve({ error: null }));
  const updateFn = jest.fn(() => ({ eq: updateEqFn }));
  const singleFn = jest.fn().mockResolvedValue({ data: paymentData, error: null });
  const eqFn = jest.fn(() => ({
    single: singleFn,
    maybeSingle: singleFn,
  }));
  const selectFn = jest.fn(() => ({ eq: eqFn }));
  const insertFn = jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) }));
  const deleteFn = jest.fn(() => ({ eq: eqFn }));
  const orderFn = jest.fn(() => ({ limit: jest.fn() }));
  const fromFn = jest.fn(() => ({ select: selectFn, update: updateFn, insert: insertFn, delete: deleteFn, order: orderFn }));
  return { from: fromFn };
}

describe('POST /api/v1/payments/webhook/flutterwave', () => {
  const mockConfirmPaymentFromFlutterwave = paymentService.confirmPaymentFromFlutterwave as jest.MockedFunction<typeof paymentService.confirmPaymentFromFlutterwave>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.FLUTTERWAVE_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 503 if webhook secret not configured', async () => {
    delete process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
      method: 'POST',
      body: JSON.stringify({ event: 'charge.completed', data: { status: 'successful', tx_ref: 'NF-123' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it('should return 401 if webhook signature is invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
      method: 'POST',
      headers: { 'verif-hash': 'wrong-secret', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ event: 'charge.completed', data: { status: 'successful', tx_ref: 'NF-123' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 and process payment on valid webhook', async () => {
    const mockPayment = {
      id: 'pay-1',
      payment_status: 'pending',
      amount: 5000,
      webhook_payload: {
        checkout_data: {
          customer_name: 'John',
          customer_email: 'john@test.com',
          customer_phone: '08012345678',
          delivery_location_id: 'loc-1',
          items: [{ product_id: 'p1', quantity: 1 }],
          subtotal: 4000,
          delivery_fee: 1000,
          total_amount: 5000,
        },
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
    };

    (mockCreateAdminClient as jest.Mock).mockReturnValue(makeSupabaseMockWithPayment(mockPayment));
    mockConfirmPaymentFromFlutterwave.mockResolvedValue(true);

    const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
      method: 'POST',
      headers: { 'verif-hash': 'test-webhook-secret', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ event: 'charge.completed', data: { status: 'successful', tx_ref: 'NF-123', amount: 5000 } }),
    });

    const res = await POST(req);
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toBe('OK');
  });

  it('should return 200 but not process for non-completed events', async () => {
    (mockCreateAdminClient as jest.Mock).mockReturnValue(makeSupabaseMock());

    const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
      method: 'POST',
      headers: { 'verif-hash': 'test-webhook-secret', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ event: 'charge.failed', data: { status: 'failed', tx_ref: 'NF-123' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockConfirmPaymentFromFlutterwave).not.toHaveBeenCalled();
  });

  it('should return 200 but skip processing if payment already paid', async () => {
    const mockPayment = {
      id: 'pay-1',
      payment_status: 'paid',
      amount: 5000,
      webhook_payload: {},
    };

    (mockCreateAdminClient as jest.Mock).mockReturnValue(makeSupabaseMockWithPayment(mockPayment));

    const req = new NextRequest('http://localhost:3000/api/v1/payments/webhook/flutterwave', {
      method: 'POST',
      headers: { 'verif-hash': 'test-webhook-secret', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({ event: 'charge.completed', data: { status: 'successful', tx_ref: 'NF-123' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockConfirmPaymentFromFlutterwave).toHaveBeenCalled();
  });
});
