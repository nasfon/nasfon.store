import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  LayoutDashboard, Package, Grid3X3, ShoppingCart, Users,
  MapPin, BarChart3, Settings, Store,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Grid3X3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery-locations", label: "Delivery Locations", icon: MapPin },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await adminClient
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  if (!profile.is_active) {
    redirect("/login?error=suspended");
  }
  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 gap-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-error" />
          <span className="text-sm font-bold text-gray-900">Admin Panel</span>
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
