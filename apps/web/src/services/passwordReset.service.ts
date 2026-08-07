import { createAdminClient } from "@/utils/supabase/admin";
import { generateOtp, hashOtp, findUserByEmail } from "@/services/otp.service";
import { sendPasswordResetEmail } from "@/services/email.service";

const RESET_TTL_MS = 10 * 60 * 1000;

interface PasswordResetRow {
  id: string;
  user_id: string;
  code_hash: string;
  expires_at: string;
  code_verified_at: string | null;
}

async function getActiveReset(email: string, codeHash: string): Promise<PasswordResetRow | null> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("password_resets")
    .select("id, user_id, code_hash, expires_at, code_verified_at")
    .eq("email", email)
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // A missing table/column here means migrations have not been applied.
    console.error("password_resets lookup failed:", error.message);
    throw new Error(
      "Password reset is not configured on this database yet. Run pending migrations, then try again."
    );
  }

  if (!data) return null;
  return data as unknown as PasswordResetRow;
}

/**
 * Sends a password reset code through Resend. Returns silently when the email
 * is unknown so the endpoint doesn't reveal which accounts exist.
 */
export async function sendPasswordResetCode(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user || !user.is_active) return;

  const adminClient = createAdminClient();
  const code = generateOtp();

  // Invalidate any previous un-used codes for this user.
  await adminClient
    .from("password_resets")
    .update({ consumed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("consumed_at", null);

  const { error } = await adminClient.from("password_resets").insert({
    user_id: user.id,
    email,
    code_hash: hashOtp(code),
    expires_at: new Date(Date.now() + RESET_TTL_MS).toISOString(),
  });
  if (error) throw new Error("Failed to create reset code");

  await sendPasswordResetEmail({ email, code });
}

/**
 * Verifies a reset code BEFORE the user can create a new password. Marks the
 * code as verified so the password step can only be reached after this succeeds.
 */
export async function verifyResetCode(params: { email: string; code: string }): Promise<void> {
  const reset = await getActiveReset(params.email, hashOtp(params.code));
  if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
    throw new Error("Invalid or expired reset code. Please request a new one.");
  }

  if (!reset.code_verified_at) {
    const adminClient = createAdminClient();
    await adminClient
      .from("password_resets")
      .update({ code_verified_at: new Date().toISOString() })
      .eq("id", reset.id);
  }
}

/**
 * Resets the user's password when they have already verified their code.
 */
export async function resetPasswordWithCode(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  const reset = await getActiveReset(params.email, hashOtp(params.code));
  if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
    throw new Error("Invalid or expired reset code. Please request a new one.");
  }
  if (!reset.code_verified_at) {
    throw new Error("Please verify your code first before setting a new password.");
  }

  const adminClient = createAdminClient();
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    reset.user_id,
    { password: params.newPassword }
  );

  if (updateError) {
    throw new Error(updateError.message || "Failed to reset password");
  }

  await adminClient
    .from("password_resets")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", reset.id);

  // Revoke every other session so a stolen session can't survive the change.
  await adminClient.auth.admin.signOut(reset.user_id, "global").catch(() => {});
}