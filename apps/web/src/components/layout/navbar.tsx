"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const { user, profile } = useAuth();
  const { data: cart } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Market
        </Link>

        <div className="hidden flex-1 md:block">
          <form onSubmit={handleSearch} className="relative mx-auto max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label={itemCount > 0 ? `Shopping cart, ${itemCount > 99 ? "99+" : itemCount} items` : "Shopping cart"}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {itemCount > 0 && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Admin Dashboard"
                >
                  <LayoutDashboard size={20} aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Dashboard"
              >
                <User size={20} aria-hidden="true" />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Logout"
              >
                <LogOut size={20} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Log in"
            >
              <User size={20} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
