"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, User, type LucideIcon } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

function BottomNavItem({ item, isActive, itemCount }: { item: NavItem; isActive: boolean; itemCount: number }) {
  const { pending } = useLinkStatus();
  const isCart = item.href === "/cart";
  const active = isActive || pending;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
        active ? "text-primary" : "text-gray-500"
      }`}
    >
      <div className={`rounded-xl p-1.5 transition-colors ${active ? "bg-primary/10" : ""}`}>
        <item.icon size={22} aria-hidden="true" />
      </div>
      <span className={`${active ? "font-semibold" : ""}`}>{item.label}</span>
      {active && <span aria-hidden="true" className="absolute -top-0.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-primary" />}
      {isCart && itemCount > 0 && (
        <span aria-hidden="true" className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const items: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: user ? "/dashboard" : "/login", label: user ? "Profile" : "Login", icon: User },
  ];

  return (
    <nav aria-label="Primary" className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-white/90 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg">
        <div className="flex items-center justify-around py-1">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <BottomNavItem key={item.href} item={item} isActive={isActive} itemCount={itemCount} />
            );
          })}
        </div>
      </div>
    </nav>
  );
}
