import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold text-gray-900">Login</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Welcome back! Sign in to your account.</p>
      <form className="mt-8 space-y-4">
        <Input id="email" label="Email" type="email" placeholder="Enter your email" />
        <Input id="password" label="Password" type="password" placeholder="Enter your password" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full">Sign In</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-hover">Sign up</Link>
      </p>
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">&larr; Continue as Guest</Link>
      </div>
    </div>
  );
}
