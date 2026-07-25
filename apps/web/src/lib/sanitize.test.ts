import {
  sanitizeHtml,
  sanitizePlainText,
  sanitizePhone,
  sanitizeName,
  sanitizeSearchQuery,
  validateFileUpload,
} from './sanitize';

describe('sanitize utils', () => {
  describe('sanitizeHtml', () => {
    it('should escape html tags', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    });
    it('should escape quotes', () => {
      expect(sanitizeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#x27;world&#x27;');
    });
  });

  describe('sanitizePlainText', () => {
    it('should remove HTML and special characters', () => {
      expect(sanitizePlainText('Hello <world> & "friends"')).toBe('Hello world friends');
    });
    it('should collapse multiple spaces', () => {
      expect(sanitizePlainText('  Hello   world  ')).toBe('Hello world');
    });
    it('should respect maxLength', () => {
      expect(sanitizePlainText('Hello world', 5)).toBe('Hello');
    });
  });

  describe('sanitizePhone', () => {
    it('should allow numbers, spaces, plus, minus, and parens', () => {
      expect(sanitizePhone('+234 (0) 800-123-4567')).toBe('+234 (0) 800-123-4567');
    });
    it('should remove letters and other characters', () => {
      expect(sanitizePhone('Call: +234800!@#')).toBe('+234800');
    });
  });

  describe('sanitizeName', () => {
    it('should strip potentially dangerous characters', () => {
      expect(sanitizeName('John <script>Doe</script>')).toBe('John scriptDoescript');
      expect(sanitizeName('O\'Connor')).toBe('OConnor');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeSearchQuery('SELECT * FROM users;--')).toBe('SELECT * FROM users--');
      expect(sanitizeSearchQuery('test () \\ ;')).toBe('test');
    });
  });

  describe('validateFileUpload', () => {
    it('should reject files that are too large', () => {
      const result = validateFileUpload('test.jpg', 6 * 1024 * 1024); // 6MB
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too large/);
    });

    it('should reject invalid extensions', () => {
      const result = validateFileUpload('test.exe', 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid file type/);
    });

    it('should accept valid images', () => {
      const result = validateFileUpload('test.jpg', 1024);
      expect(result.valid).toBe(true);
    });
    
    it('should accept valid upper case extensions', () => {
      const result = validateFileUpload('test.PNG', 1024);
      expect(result.valid).toBe(true);
    });
  });
});
