import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";

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
        <CustomerSidebar />
      </aside>
      <div className="flex-1 min-w-0">
        <MobileMenu />
        {children}
      </div>
    </div>
  );
}
