import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { cartItemSchema } from "@/lib/validation";
import * as cartService from "@/services/cart.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const result = await cartService.addCartItem(parsed.data.product_id, parsed.data.quantity);
    return successResponse(result, "Item added to cart");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to add item", [], 400);
  }
}
