import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as ordersService from "@/services/admin/orders.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const orders = await ordersService.getAdminOrders();
    return successResponse(orders);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch orders", [], 500);
  }
}
