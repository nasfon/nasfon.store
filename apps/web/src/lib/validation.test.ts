import {
  registerSchema,
  loginSchema,
  paginationSchema,
  adminSettingsSchema,
} from './validation';

describe('validation schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid data', () => {
      const data = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        full_name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject short password', () => {
      const data = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'pass',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid credentials', () => {
      const result = loginSchema.safeParse({ email: 'test@test.com', password: '123' });
      expect(result.success).toBe(true);
    });
  });

  describe('paginationSchema', () => {
    it('should use default values if empty', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce strings to numbers', () => {
      const result = paginationSchema.safeParse({ page: '2', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });
  });

  describe('adminSettingsSchema', () => {
    it('should convert empty strings to null', () => {
      const result = adminSettingsSchema.safeParse({ support_phone: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.support_phone).toBeNull();
      }
    });

    it('should allow valid email for admin_email', () => {
      const result = adminSettingsSchema.safeParse({ admin_email: 'admin@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email for admin_email', () => {
      const result = adminSettingsSchema.safeParse({ admin_email: 'not-an-email' });
      expect(result.success).toBe(false);
    });
  });
});
