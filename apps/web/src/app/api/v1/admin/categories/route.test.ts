/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as categoriesService from '@/services/admin/categories.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/categories.service', () => ({
  getAdminCategories: jest.fn(),
  createCategory: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const VALID_CATEGORY = { name: 'Electronics', slug: 'electronics' };

describe('GET /api/v1/admin/categories', () => {
  const mockGetAdminCategories = categoriesService.getAdminCategories as jest.MockedFunction<typeof categoriesService.getAdminCategories>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 with categories', async () => {
    const mockCategories = [{ id: 'c1', name: 'Electronics' }];
    mockGetAdminCategories.mockResolvedValue(mockCategories);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCategories);
  });

  it('should return 500 if service fails', async () => {
    mockGetAdminCategories.mockRejectedValue(new Error('Failed to fetch categories'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to fetch categories');
  });
});

describe('POST /api/v1/admin/categories', () => {
  const mockCreateCategory = categoriesService.createCategory as jest.MockedFunction<typeof categoriesService.createCategory>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/categories', {
      method: 'POST', body: JSON.stringify({ name: 'A' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 201 on successful creation', async () => {
    const mockCategory = { id: 'c1', ...VALID_CATEGORY };
    mockCreateCategory.mockResolvedValue(mockCategory);

    const req = new NextRequest('http://localhost:3000/api/v1/admin/categories', {
      method: 'POST', body: JSON.stringify(VALID_CATEGORY),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data).toEqual(mockCategory);
    expect(data.message).toBe('Category created');
  });
});
