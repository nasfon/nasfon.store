/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as settingsService from '@/services/admin/settings.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/settings.service', () => ({
  getAdminSettings: jest.fn(),
  updateSettings: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

describe('GET /api/v1/admin/settings', () => {
  const mockGetAdminSettings = settingsService.getAdminSettings as jest.MockedFunction<typeof settingsService.getAdminSettings>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 with settings', async () => {
    const mockSettings = { support_phone: '08012345678', support_email: 'support@store.com' };
    mockGetAdminSettings.mockResolvedValue(mockSettings);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockSettings);
  });
});

describe('PATCH /api/v1/admin/settings', () => {
  const mockUpdateSettings = settingsService.updateSettings as jest.MockedFunction<typeof settingsService.updateSettings>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/settings', {
      method: 'PATCH', body: JSON.stringify({ support_email: 'invalid' }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('should return 200 on successful update', async () => {
    const mockSettings = { support_phone: '08098765432' };
    mockUpdateSettings.mockResolvedValue(mockSettings);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/settings', {
      method: 'PATCH', body: JSON.stringify({ support_phone: '08098765432' }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockSettings);
    expect(data.message).toBe('Settings updated');
  });
});
