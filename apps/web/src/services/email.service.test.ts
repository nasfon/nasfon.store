/**
 * @jest-environment node
 */
import { sendOtpEmail } from './email.service';

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

describe('sendOtpEmail', () => {
  const email = 'user@example.com';
  const code = '123456';

  beforeEach(() => {
    jest.resetModules();
    process.env.RESEND_API_KEY = 're_test';
    process.env.FROM_EMAIL = 'Test <test@example.com>';
    mockSend.mockReset();
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.FROM_EMAIL;
  });

  it('should send the verification code email', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
    await expect(sendOtpEmail({ email, code, purpose: 'signup' })).resolves.toBeUndefined();

    const [payload] = mockSend.mock.calls[0];
    expect(payload.to).toBe(email);
    expect(payload.subject).toContain('Verify your email');
    expect(payload.html).toContain(code);
  });

  it('should throw when delivery fails (fail loudly, no silent success)', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: {
        name: 'application_error',
        statusCode: null,
        message: 'Unable to fetch data. The request could not be resolved.',
      },
    });

    await expect(sendOtpEmail({ email, code, purpose: 'signup' })).rejects.toThrow(
      /Email delivery failed because/
    );
  });

  it('should surface actionable guidance for an unverified sender domain', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: {
        name: 'validation_error',
        statusCode: 403,
        message:
          'The market.nasfon.com domain is not verified. Please, add and verify your domain on https://resend.com/domains',
      },
    });

    await expect(sendOtpEmail({ email, code, purpose: 'signup' })).rejects.toThrow(
      /sender domain "market\.nasfon\.com" is not verified/
    );
  });

  it('should throw when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    mockSend.mockResolvedValue({ data: null, error: null });

    await expect(sendOtpEmail({ email, code })).rejects.toThrow(
      /RESEND_API_KEY/
    );
  });
});