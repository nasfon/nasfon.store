import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { requireUser } from "@/lib/api";
import * as orderService from "@/services/order.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { id } = await params;
    const order = await orderService.getOrderById(id, user.id);
    return successResponse(order);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Order not found", [], 404);
  }
}
