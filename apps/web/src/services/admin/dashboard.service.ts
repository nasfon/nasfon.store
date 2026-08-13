import { createAdminClient } from "@/utils/supabase/admin";

export async function getDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: lowStockProducts },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("id, name, sku, stock_quantity, selling_price").eq("is_active", true).lt("stock_quantity", 10).order("stock_quantity", { ascending: true }).limit(5),
    supabase.from("orders").select("*, payment:payments(*)").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  return {
    stats: {
      total_orders: totalOrders || 0,
      pending_orders: pendingOrders || 0,
      total_products: totalProducts || 0,
      total_customers: totalCustomers || 0,
      total_revenue: totalRevenue,
    },
    low_stock_products: lowStockProducts || [],
    recent_orders: recentOrders || [],
  };
}
