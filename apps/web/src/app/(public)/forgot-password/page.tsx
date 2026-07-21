import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Reset Password</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form className="mt-8 space-y-4">
        <Input id="email" label="Email" type="email" placeholder="Enter your email" />
        <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-primary hover:text-primary-hover">Back to Login</Link>
      </p>
    </div>
  );
}
