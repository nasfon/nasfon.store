"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isCart = item.href === "/cart";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <item.icon size={22} />
              {item.label}
              {isCart && itemCount > 0 && (
                <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
