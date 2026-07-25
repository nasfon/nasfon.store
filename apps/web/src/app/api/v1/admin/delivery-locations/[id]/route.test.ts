/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from './route';
import * as locationsService from '@/services/admin/delivery-locations.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/delivery-locations.service', () => ({
  updateDeliveryLocation: jest.fn(),
  deleteDeliveryLocation: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const LOCATION_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('PATCH /api/v1/admin/delivery-locations/[id]', () => {
  const mockUpdateLocation = locationsService.updateDeliveryLocation as jest.MockedFunction<typeof locationsService.updateDeliveryLocation>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 on successful update', async () => {
    const mockLocation = { id: LOCATION_ID, delivery_fee: 2000 };
    mockUpdateLocation.mockResolvedValue(mockLocation);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/delivery-locations/${LOCATION_ID}`, {
      method: 'PATCH', body: JSON.stringify({ delivery_fee: 2000 }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: LOCATION_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockLocation);
    expect(data.message).toBe('Location updated');
  });
});

describe('DELETE /api/v1/admin/delivery-locations/[id]', () => {
  const mockDeleteLocation = locationsService.deleteDeliveryLocation as jest.MockedFunction<typeof locationsService.deleteDeliveryLocation>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 on successful deletion', async () => {
    mockDeleteLocation.mockResolvedValue(undefined);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/delivery-locations/${LOCATION_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: LOCATION_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Location deleted');
  });
});
