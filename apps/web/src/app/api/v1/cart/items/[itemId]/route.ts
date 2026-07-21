import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { cartItemSchema } from "@/lib/validation";
import * as cartService from "@/services/cart.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const parsed = cartItemSchema.safeParse({ ...body, product_id: itemId });
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const result = await cartService.updateCartItem(itemId, parsed.data.quantity);
    return successResponse(result, "Cart updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update item", [], 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const result = await cartService.removeCartItem(itemId);
    return successResponse(result, "Item removed from cart");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to remove item", [], 400);
  }
}
