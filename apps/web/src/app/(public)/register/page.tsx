import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Sign up for faster checkout and order tracking.</p>
      <form className="mt-8 space-y-4">
        <Input id="full-name" label="Full Name" placeholder="Enter your full name" />
        <Input id="email" label="Email" type="email" placeholder="Enter your email" />
        <Input id="password" label="Password" type="password" placeholder="Create a password" />
        <p className="text-xs text-gray-400">Minimum 8 characters</p>
        <Button type="submit" size="lg" className="w-full">Create Account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
      </p>
    </div>
  );
}
