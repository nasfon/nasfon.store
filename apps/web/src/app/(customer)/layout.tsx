import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Package, User, Star, LayoutDashboard } from "lucide-react";
import { MobileMenu } from "@/components/layout/mobile-menu";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: profile } = await adminClient
    .from("users")
    .select("is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await adminClient.from("users").upsert({
      id: user.id,
      full_name: user.email?.split("@")[0] || "User",
      email: user.email || "",
      role: "customer",
      is_active: true,
    }, { onConflict: "id" });
  }

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }
  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 gap-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <h2 className="mb-4 text-lg font-bold text-gray-900">My Account</h2>
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
      <div className="flex-1 min-w-0">
        <MobileMenu />
        {children}
      </div>
    </div>
  );
}
