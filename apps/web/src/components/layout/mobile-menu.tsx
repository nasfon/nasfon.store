"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Package, User, Star, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/utils/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

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
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        <div className="rounded-t-2xl">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button
              ref={closeRef}
              onClick={close}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="mx-4 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <User size={20} aria-hidden="true" />
            </div>
            <p className="mt-2 font-semibold text-gray-900">{profile?.full_name || user?.email?.split("@")[0] || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email || ""}</p>
          </div>
        </div>

        <nav aria-label="Mobile menu" className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} aria-hidden="true" />
                    {link.label}
                  </div>
                  <ChevronRight size={16} className={isActive ? "text-white" : "text-gray-300"} aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
