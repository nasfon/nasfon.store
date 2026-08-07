import { createHash, randomInt } from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendOtpEmail } from "@/services/email.service";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

const OTP_TTL_MS = 10 * 60 * 1000;

export type OtpPurpose = "signup" | "login";

export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createAndSendOtp(params: {
  userId: string;
  email: string;
  purpose: OtpPurpose;
}) {
  const adminClient = createAdminClient();
  const code = generateOtp();

  await adminClient.from("otp_codes").insert({
    user_id: params.userId,
    purpose: params.purpose,
    code_hash: hashOtp(code),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });

  await sendOtpEmail({ email: params.email, code });

  return { expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString() };
}

export async function verifyOtp(params: {
  userId: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<boolean> {
  const adminClient = createAdminClient();
  const codeHash = hashOtp(params.code);

  const { data, error } = await adminClient
    .from("otp_codes")
    .select("id, expires_at, purpose")
    .eq("user_id", params.userId)
    .eq("purpose", params.purpose)
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;

  await adminClient
    .from("otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id);

  return true;
}

export async function findUserByEmail(email: string) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("users")
    .select("id, email, email_verified_at, is_active")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

interface PendingRegistrationRow {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  password_enc: string;
  password_iv: string;
  password_tag: string;
  otp_hash: string;
  otp_expires_at: string;
}

async function getPendingRegistration(email: string): Promise<PendingRegistrationRow | null> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("pending_registrations")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PendingRegistrationRow;
}

/**
 * Stages a signup: the auth user and profile are NOT created until the OTP is
 * verified. The password is stored encrypted so it can be used to create the
 * account at verification time.
 */
export async function createPendingRegistration(params: {
  email: string;
  full_name: string;
  phone_number?: string;
  password: string;
}) {
  const adminClient = createAdminClient();
  const code = generateOtp();
  const { encrypted, iv, tag } = encryptSecret(params.password);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const { error } = await adminClient.from("pending_registrations").upsert(
    {
      email: params.email,
      full_name: params.full_name,
      phone_number: params.phone_number || null,
      password_enc: encrypted,
      password_iv: iv,
      password_tag: tag,
      otp_hash: hashOtp(code),
      otp_expires_at: expiresAt.toISOString(),
    },
    { onConflict: "email" }
  );

  if (error) throw new Error("Failed to stage registration");

  await sendOtpEmail({ email: params.email, code, purpose: "signup" });
  return { expiresAt: expiresAt.toISOString() };
}

export async function resendPendingOtp(email: string): Promise<boolean> {
  const pending = await getPendingRegistration(email);
  if (!pending) return false;

  const adminClient = createAdminClient();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await adminClient
    .from("pending_registrations")
    .update({ otp_hash: hashOtp(code), otp_expires_at: expiresAt.toISOString() })
    .eq("id", pending.id);

  await sendOtpEmail({ email, code, purpose: "signup" });
  return true;
}

/**
 * Verifies a signup OTP and, only on success, creates the Supabase auth user
 * and the profile. Cleans up the staged registration afterwards.
 */
export async function verifyAndCompleteSignup(params: { email: string; code: string }) {
  const adminClient = createAdminClient();
  const pending = await getPendingRegistration(params.email);
  if (!pending) {
    throw new Error("No pending registration found for this email");
  }

  if (
    hashOtp(params.code) !== pending.otp_hash ||
    new Date(pending.otp_expires_at).getTime() < Date.now()
  ) {
    throw new Error("Invalid or expired verification code");
  }

  const { data: existing } = await adminClient
    .from("users")
    .select("id")
    .eq("email", params.email)
    .maybeSingle();
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const password = decryptSecret({
    encrypted: pending.password_enc,
    iv: pending.password_iv,
    tag: pending.password_tag,
  });

  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email: pending.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: pending.full_name },
  });

  if (createError || !authData.user) {
    throw new Error(createError?.message || "Failed to create account");
  }

  const { error: profileError } = await adminClient.from("users").insert({
    id: authData.user.id,
    full_name: pending.full_name,
    email: pending.email,
    phone_number: pending.phone_number,
    role: "customer",
    is_active: true,
    email_verified_at: new Date().toISOString(),
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id).catch(() => {});
    throw new Error("Failed to create profile");
  }

  await adminClient.from("pending_registrations").delete().eq("id", pending.id);

  return { user: authData.user };
}