"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { adminNavLinks } from "./admin-nav";

export function AdminMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

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
      <div className="sticky top-14 z-30 -mx-4 mb-4 flex items-center gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
          aria-label="Open admin menu"
          aria-expanded={open}
          aria-controls="admin-mobile-menu-panel"
        >
          <Menu size={18} aria-hidden="true" />
          Menu
        </button>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-error" />
          <span className="text-sm font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} />}

      <div
        id="admin-mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed bottom-0 left-0 top-14 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-error" />
            <span className="text-base font-bold text-gray-900">Admin Panel</span>
          </div>
          <button
            ref={closeRef}
            onClick={close}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close admin menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Admin menu" className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-0.5">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <Link
            href="/"
            onClick={close}
            className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </>
  );
}