import {
  registerSchema,
  loginSchema,
  paginationSchema,
  adminSettingsSchema,
  otpSendSchema,
  otpVerifySchema,
} from './validation';

describe('validation schemas', () => {
  describe('registerSchema', () => {
    const validBase = {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'Secure#Pass123',
      confirm_password: 'Secure#Pass123',
    };

    it('should validate valid data', () => {
      const result = registerSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({ ...validBase, email: 'invalid-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'Ab#1' });
      expect(result.success).toBe(false);
    });

    it('should reject password without capital letter', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'secure#pass123' });
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'SECURE#PASS123' });
      expect(result.success).toBe(false);
    });

    it('should reject password without a number', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'Secure#PassWord' });
      expect(result.success).toBe(false);
    });

    it('should reject password without a symbol', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'SecurePass123' });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched confirm password', () => {
      const result = registerSchema.safeParse({ ...validBase, confirm_password: 'Different!2' });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid credentials', () => {
      const result = loginSchema.safeParse({ email: 'test@test.com', password: '123' });
      expect(result.success).toBe(true);
    });

    it('should accept otp_reverify flag', () => {
      const result = loginSchema.safeParse({ email: 'test@test.com', password: '123', otp_reverify: true });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.otp_reverify).toBe(true);
    });
  });

  describe('otpSendSchema', () => {
    it('should validate valid request', () => {
      const result = otpSendSchema.safeParse({ purpose: 'signup', email: 'test@test.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid purpose', () => {
      const result = otpSendSchema.safeParse({ purpose: 'other', email: 'test@test.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('otpVerifySchema', () => {
    it('should validate valid 6-digit code', () => {
      const result = otpVerifySchema.safeParse({ purpose: 'login', email: 'test@test.com', code: '123456' });
      expect(result.success).toBe(true);
    });

    it('should reject non-6-digit code', () => {
      const result = otpVerifySchema.safeParse({ purpose: 'login', email: 'test@test.com', code: '12345' });
      expect(result.success).toBe(false);
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
