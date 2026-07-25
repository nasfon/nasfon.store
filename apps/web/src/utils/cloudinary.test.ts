import { cloudinaryUrl } from './cloudinary';

describe('cloudinaryUrl', () => {
  it('should return original url if it does not contain cloud name', () => {
    const url = 'https://example.com/image.jpg';
    expect(cloudinaryUrl(url)).toBe(url);
  });

  it('should return original url if url does not contain /upload/', () => {
    const url = 'https://res.cloudinary.com/test-cloud/image/fetch/v1/image.jpg';
    expect(cloudinaryUrl(url)).toBe(url);
  });

  it('should insert transformations correctly', () => {
    const url = 'https://res.cloudinary.com/test-cloud/image/upload/v12345/image.jpg';
    const result = cloudinaryUrl(url, { width: 500, height: 400, format: 'webp', quality: '80' });
    expect(result).toBe('https://res.cloudinary.com/test-cloud/image/upload/w_500,h_400,f_webp,q_80/v12345/image.jpg');
  });

  it('should use auto quality if not provided', () => {
    const url = 'https://res.cloudinary.com/test-cloud/image/upload/v12345/image.jpg';
    const result = cloudinaryUrl(url, { width: 500 });
    expect(result).toBe('https://res.cloudinary.com/test-cloud/image/upload/w_500,q_auto/v12345/image.jpg');
  });
});
