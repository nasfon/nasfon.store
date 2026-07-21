import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          NasFon Store
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="relative mx-auto max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search products..."
              className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/categories"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Categories
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
          >
            <ShoppingCart size={20} />
          </Link>
          <Link
            href="/login"
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          >
            <User size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
