/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as locationsService from '@/services/admin/delivery-locations.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/delivery-locations.service', () => ({
  getAdminDeliveryLocations: jest.fn(),
  createDeliveryLocation: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const VALID_LOCATION = {
  name: 'Main Office',
  delivery_fee: 1000,
  estimated_delivery_days: 3,
};

describe('GET /api/v1/admin/delivery-locations', () => {
  const mockGetLocations = locationsService.getAdminDeliveryLocations as jest.MockedFunction<typeof locationsService.getAdminDeliveryLocations>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 with locations', async () => {
    const mockLocations = [{ id: 'loc1', name: 'Main Office', delivery_fee: 1000 }];
    mockGetLocations.mockResolvedValue(mockLocations);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockLocations);
  });
});

describe('POST /api/v1/admin/delivery-locations', () => {
  const mockCreateLocation = locationsService.createDeliveryLocation as jest.MockedFunction<typeof locationsService.createDeliveryLocation>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/delivery-locations', {
      method: 'POST', body: JSON.stringify({ name: 'A' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 201 on successful creation', async () => {
    const mockLocation = { id: 'loc1', ...VALID_LOCATION };
    mockCreateLocation.mockResolvedValue(mockLocation);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/delivery-locations', {
      method: 'POST', body: JSON.stringify(VALID_LOCATION),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data).toEqual(mockLocation);
  });
});
