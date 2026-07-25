/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from './route';
import * as categoriesService from '@/services/admin/categories.service';
import * as apiLib from '@/lib/api';

jest.mock('@/services/admin/categories.service', () => ({
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  const original = jest.requireActual('@/lib/api');
  return {
    ...original,
    requireAdmin: jest.fn(),
  };
});

const CATEGORY_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('PATCH /api/v1/admin/categories/[id]', () => {
  const mockUpdateCategory = categoriesService.updateCategory as jest.MockedFunction<typeof categoriesService.updateCategory>;
  const mockRequireAdmin = apiLib.requireAdmin as jest.MockedFunction<typeof apiLib.requireAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } as any, error: null });
  });

  it('should return 200 on successful update', async () => {
    const mockCategory = { id: CATEGORY_ID, name: 'Updated' };
    mockUpdateCategory.mockResolvedValue(mockCategory);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/categories/${CATEGORY_ID}`, {
      method: 'PATCH', body: JSON.stringify({ name: 'Updated' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: CATEGORY_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(mockCategory);
    expect(data.message).toBe('Category updated');
  });

  it('should return 400 if service fails', async () => {
    mockUpdateCategory.mockRejectedValue(new Error('Failed to update category'));

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/categories/${CATEGORY_ID}`, {
      method: 'PATCH', body: JSON.stringify({ name: 'Updated' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: CATEGORY_ID }) });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/v1/admin/categories/[id]', () => {
  const mockDeleteCategory = categoriesService.deleteCategory as jest.MockedFunction<typeof categoriesService.deleteCategory>;

  beforeEach(() => {
    jest.clearAllMocks();
    (apiLib.requireAdmin as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' }, error: null });
  });

  it('should return 200 on successful deletion', async () => {
    mockDeleteCategory.mockResolvedValue(undefined);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/categories/${CATEGORY_ID}`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: CATEGORY_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Category deleted');
  });
});
