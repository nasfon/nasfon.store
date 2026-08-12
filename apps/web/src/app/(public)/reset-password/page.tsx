"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const passwordRequirements = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One capital letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One symbol" },
];

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-sm px-4 py-16">
          <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const missing = passwordRequirements
    .filter((r) => !r.test(password))
    .map((r) => r.label);

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Verification failed");
        setLoading(false);
        return;
      }

      setStep("reset");
      setLoading(false);
    } catch {
      toast.error("Verification failed");
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.message || "Failed to resend code");
        return;
      }

      toast.success("A new code has been sent to your email.");
    } catch {
      setLoading(false);
      toast.error("Failed to resend code");
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (missing.length > 0) {
      toast.error(`Password must include: ${missing.join(", ")}`);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Failed to reset password");
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Missing Email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We couldn&apos;t identify your account. Please request a new reset code.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" className="mt-6">
            Request a Reset Code
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      {step === "verify" ? (
        <>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Enter Verification Code
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it to verify your identity.
          </p>

          <form onSubmit={verifyCode} className="mt-8 space-y-4">
            <Input
              id="code"
              label="Verification Code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={code.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="font-medium text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Resend code
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Create New Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Your code was verified. Choose a strong new password for <strong>{email}</strong>.
          </p>

          <form onSubmit={resetPassword} className="mt-8 space-y-4">
            <Input
              id="password"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </>
      )}

      <div className="mt-8 text-center">
        {step === "verify" ? (
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            Remember your password? Sign in
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            &larr; Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}