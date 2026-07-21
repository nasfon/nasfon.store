import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminOrderUpdateSchema } from "@/lib/validation";
import * as ordersService from "@/services/admin/orders.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const order = await ordersService.getAdminOrderById(id);
    return successResponse(order);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Order not found", [], 404);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = adminOrderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const order = await ordersService.updateOrder(id, parsed.data);
    return successResponse(order, "Order updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update order", [], 400);
  }
}
