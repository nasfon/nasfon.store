import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { uuidSchema } from "@/lib/validation";
import { getPaymentStatus } from "@/services/payment.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const parsed = uuidSchema.safeParse(orderId);
    if (!parsed.success) return errorResponse("Invalid order ID");
    const result = await getPaymentStatus(orderId);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to check payment", [], 404);
  }
}
