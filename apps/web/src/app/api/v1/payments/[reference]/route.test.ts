/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as flutterwaveService from '@/services/flutterwave';
import * as paymentService from '@/services/payment.service';

jest.mock('@/services/flutterwave', () => ({
  getCharge: jest.fn(),
}));

jest.mock('@/services/payment.service', () => ({
  confirmPaymentFromFlutterwave: jest.fn(),
  expirePayment: jest.fn(),
}));

const REFERENCE = 'NF-TEST123';

describe('GET /api/v1/payments/[reference]', () => {
  const mockGetCharge = flutterwaveService.getCharge as jest.MockedFunction<typeof flutterwaveService.getCharge>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 503 if Flutterwave credentials are not configured', async () => {
    process.env = { ...originalEnv };
    delete process.env.FLUTTERWAVE_CLIENT_ID;
    delete process.env.FLUTTERWAVE_CLIENT_SECRET;

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.message).toBe('Payment not configured');
  });

  it('should return 404 if charge not found', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';
    mockGetCharge.mockResolvedValue(null);

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe('Payment not found');
  });

  it('should return 200 with charge status', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';
    mockGetCharge.mockResolvedValue({ id: 'ch-1', status: 'successful', amount: 5000, paid_at: '2025-01-01T00:00:00Z' });

    const mockConfirm = paymentService.confirmPaymentFromFlutterwave as jest.MockedFunction<typeof paymentService.confirmPaymentFromFlutterwave>;
    mockConfirm.mockResolvedValue(true);

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('successful');
    expect(data.data.amount).toBe(5000);
    expect(mockConfirm).toHaveBeenCalledWith(REFERENCE, 5000);
  });

  it('should return 500 if service throws an error', async () => {
    process.env.FLUTTERWAVE_CLIENT_ID = 'test-client';
    process.env.FLUTTERWAVE_CLIENT_SECRET = 'test-secret';
    mockGetCharge.mockRejectedValue(new Error('API error'));

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
