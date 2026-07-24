import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { orderTrackSchema } from "@/lib/validation";
import * as orderService from "@/services/order.service";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "track");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      order_number: searchParams.get("order_number") || "",
      phone_number: searchParams.get("phone_number") || "",
    };

    const parsed = orderTrackSchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse("Invalid parameters", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const order = await orderService.trackOrder(parsed.data.order_number, parsed.data.phone_number);
    return successResponse(order);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Order not found", [], 404);
  }
}
