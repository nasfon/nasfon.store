"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose = searchParams.get("purpose") === "login" ? "login" : "signup";
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const isSignup = purpose === "signup";

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/v1/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ purpose, code, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.message || "Verification failed");
      return;
    }

    toast.success(isSignup ? "Account created! Sign in to continue." : "Verification successful!");
    if (isSignup) {
      router.push("/login?verified=1");
    } else {
      router.push("/dashboard");
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    setLoading(true);

    const res = await fetch("/api/v1/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ purpose, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.message || "Failed to resend code");
      return;
    }

    toast.success("A new code has been sent to your email.");
    setResendIn(60);
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      {!email ? (
        <>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Missing Email
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            We couldn&apos;t identify your account. Please sign in or register again.
          </p>
          <div className="mt-8 text-center">
            <Link
              href={isSignup ? "/register" : "/login"}
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              {isSignup ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            {isSignup ? "Verify Your Email" : "Confirm Your Login"}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
          </p>

          <form onSubmit={verify} className="mt-8 space-y-4">
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
            <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={resend}
              disabled={loading || resendIn > 0}
              className="font-medium text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>

          <div className="mt-8 text-center">
            {isSignup ? (
              <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
                Already verified? Sign in
              </Link>
            ) : (
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
                &larr; Back to store
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-sm px-4 py-16">
          <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
        </div>
      }
    >
      <OtpContent />
    </Suspense>
  );
}