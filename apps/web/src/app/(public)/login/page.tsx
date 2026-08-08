"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error");
  const verifiedParam = searchParams.get("verified");
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [suspendedAlert, setSuspendedAlert] = useState(errorParam === "suspended");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const needsOtpAfterLogin = reason === "token_expired";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ email, password, otp_reverify: needsOtpAfterLogin || undefined }),
    });

    const data = await res.json();

    if (!data.success) {
      if (data.message?.toLowerCase().includes("suspended")) {
        setSuspendedAlert(true);
      }
      toast.error(data.message || "Login failed");
      setLoading(false);
      return;
    }

    const role = data.data?.profile?.role || "customer";
    toast.success("Welcome back!");

    if (reason === "token_expired") {
      router.push(`/otp?purpose=login&email=${encodeURIComponent(email)}`);
      return;
    }

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Login</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Welcome back! Sign in to your account.</p>

      {reason === "token_expired" && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your session has expired. Sign in and confirm your identity to continue.
        </div>
      )}

      {verifiedParam === "1" && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your email has been verified successfully. You can now sign in.
        </div>
      )}

      {suspendedAlert && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Your account has been suspended. Please contact support.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16"><div className="h-96 animate-pulse rounded-lg bg-gray-100" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
