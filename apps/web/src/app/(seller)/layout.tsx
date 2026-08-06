import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { LayoutDashboard, Package, MapPin, ShoppingCart, CreditCard, Store, Clock, XCircle } from "lucide-react";
import { MobileMenu } from "@/components/layout/mobile-menu";

const sidebarLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/dashboard/products", label: "Products", icon: Package },
  { href: "/seller/dashboard/delivery-locations", label: "Delivery Locations", icon: MapPin },
  { href: "/seller/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/dashboard/payment", label: "Payments", icon: CreditCard },
];

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/seller/dashboard");
  }

  const { data: profile } = await adminClient
    .from("users")
    .select("is_active, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    redirect("/");
  }

  const { data: seller } = await adminClient
    .from("sellers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!seller) {
    redirect("/seller/apply");
  }

  if (seller.verification_status !== "approved") {
    const isRejected = seller.verification_status === "rejected";
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          {isRejected ? (
            <XCircle size={32} className="text-red-500" />
          ) : (
            <Clock size={32} className="text-yellow-500" />
          )}
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isRejected ? "Application Rejected" : "Application Under Review"}
        </h1>
        <p className="mt-3 text-gray-600">
          {isRejected
            ? "Your seller application was rejected. Contact support or update your details to re-apply."
            : "Your seller application is pending review. You will gain access to the seller dashboard once an admin verifies your documents."}
        </p>
        <Link
          href="/dashboard"
          className="mt-8 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go to Customer Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 gap-8">
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="mb-4 flex items-center gap-2">
          <Store size={18} className="text-black" />
          <span className="text-sm font-bold text-gray-900">Seller Dashboard</span>
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
      <div className="flex-1 min-w-0">
        <MobileMenu />
        {children}
      </div>
    </div>
  );
}