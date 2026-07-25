/**
 * @jest-environment node
 */
import { POST } from './route';
import * as authService from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  logout: jest.fn(),
}));

describe('POST /api/v1/auth/logout', () => {
  const mockLogout = authService.logout as jest.MockedFunction<typeof authService.logout>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if logout service throws an error', async () => {
    mockLogout.mockRejectedValue(new Error('Session not found'));

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Session not found');
  });

  it('should return 200 on successful logout', async () => {
    mockLogout.mockResolvedValue();

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logged out successfully');
  });
});
