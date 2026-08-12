"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Menu, LayoutDashboard, Package, User, Star, LogOut, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSellerProfile } from "@/hooks/use-seller";
import { createClient } from "@/utils/supabase/client";

const navGroups = [
  {
    label: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/orders", label: "My Orders", icon: Package },
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
    ],
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  const { data: sellerProfile } = useSellerProfile();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);
  const isApprovedSeller = sellerProfile?.verification_status === "approved";

  const handleLogout = async () => {
    close();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", handleEscape);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} />}

      <div
        ref={panelRef}
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {profile?.full_name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="truncate text-sm text-gray-500">{user?.email || ""}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={close}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile menu" className="flex-1 overflow-y-auto px-4 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {isApprovedSeller && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Selling
              </p>
              <Link
                href="/seller/dashboard"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Store size={18} aria-hidden="true" />
                Seller Dashboard
              </Link>
            </div>
          )}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}