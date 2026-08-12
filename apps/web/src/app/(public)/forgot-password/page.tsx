"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Failed to send reset email");
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;ve sent a reset code to <strong>{email}</strong>. Enter it together
          with your new password.
        </p>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button variant="outline" className="mt-6">
            Enter Your Code
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Forgot Password</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Enter your email and we&apos;ll send you a reset code.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
