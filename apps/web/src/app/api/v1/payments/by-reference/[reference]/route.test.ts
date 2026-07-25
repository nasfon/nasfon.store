/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as paymentService from '@/services/payment.service';

jest.mock('@/services/payment.service', () => ({
  getPaymentByReference: jest.fn(),
}));

const REFERENCE = 'NF-TEST123';

describe('GET /api/v1/payments/by-reference/[reference]', () => {
  const mockGetPaymentByReference = paymentService.getPaymentByReference as jest.MockedFunction<typeof paymentService.getPaymentByReference>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if payment not found', async () => {
    mockGetPaymentByReference.mockRejectedValue(new Error('Payment not found'));

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/by-reference/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.message).toBe('Payment not found');
  });

  it('should return 200 with payment details', async () => {
    const mockResult = {
      payment_status: 'paid',
      order: { id: 'order-1', order_number: 'NF-001', order_status: 'payment_confirmed', payment_status: 'paid' },
      payment: { id: 'pay-1', amount: 5000 },
      amount_mismatch: false,
    };
    mockGetPaymentByReference.mockResolvedValue(mockResult as any);

    const req = new NextRequest(`http://localhost:3000/api/v1/payments/by-reference/${REFERENCE}`, {
      method: 'GET',
    });

    const res = await GET(req, { params: Promise.resolve({ reference: REFERENCE }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResult);
  });
});
