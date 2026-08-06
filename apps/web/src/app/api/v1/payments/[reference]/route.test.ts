/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as paystackService from '@/services/paystack';
import * as paymentService from '@/services/payment.service';

jest.mock('@/services/paystack', () => ({
  verifyTransaction: jest.fn(),
}));

jest.mock('@/services/payment.service', () => ({
  confirmPaymentFromPaystack: jest.fn(),
  expirePayment: jest.fn(),
}));

const REFERENCE = 'NF-TEST123';

describe('GET /api/v1/payments/[reference]', () => {
  const mockVerifyTransaction = paystackService.verifyTransaction as jest.MockedFunction<typeof paystackService.verifyTransaction>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 503 if Paystack credentials are not configured', async () => {
    process.env = { ...originalEnv };
    delete process.env.PAYSTACK_SECRET_KEY;

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.message).toBe('Payment not configured');
  });

  it('should return 404 if charge not found', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_123';
    mockVerifyTransaction.mockRejectedValue(new Error('Transaction not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });

    expect(res.status).toBe(500);
  });

  it('should return 200 with charge status', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_123';
    mockVerifyTransaction.mockResolvedValue({ status: 'success', amount: 5000, reference: REFERENCE, paid_at: '2025-01-01T00:00:00Z' });

    const mockConfirm = paymentService.confirmPaymentFromPaystack as jest.MockedFunction<typeof paymentService.confirmPaymentFromPaystack>;
    mockConfirm.mockResolvedValue(true);

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('success');
    expect(data.data.amount).toBe(5000);
    expect(mockConfirm).toHaveBeenCalledWith(REFERENCE);
  });

  it('should return 500 if service throws an error', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_123';
    mockVerifyTransaction.mockRejectedValue(new Error('API error'));

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('API error');
  });
});

describe('PATCH /api/v1/payments/[reference]', () => {
  const mockExpirePayment = paymentService.expirePayment as jest.MockedFunction<typeof paymentService.expirePayment>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 on successful expiry', async () => {
    mockExpirePayment.mockResolvedValue({ expired: true });

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'PATCH',
    });

    const res = await PATCH(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({ expired: true });
  });

  it('should return 400 if payment not found', async () => {
    mockExpirePayment.mockRejectedValue(new Error('Payment not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'PATCH',
    });

    const res = await PATCH(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Payment not found');
  });
});
