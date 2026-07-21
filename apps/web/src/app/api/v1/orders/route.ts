import { successResponse, errorResponse } from "@/lib/api";
import { requireUser } from "@/lib/api";
import * as orderService from "@/services/order.service";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const orders = await orderService.getCustomerOrders(user.id);
    return successResponse(orders);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch orders", [], 500);
  }
}
