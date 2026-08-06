"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        phone_number: phone || undefined,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message || "Registration failed");
      setLoading(false);
      return;
    }

    toast.success("Account created successfully!");
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Join Market for faster checkout and order tracking.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="full_name"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          id="phone"
          label="Phone Number"
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          &larr; Continue as Guest
        </Link>
      </div>
    </div>
  );
}
