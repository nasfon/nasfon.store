import { successResponse, errorResponse } from "@/lib/api";
import * as cartService from "@/services/cart.service";

export async function GET() {
  try {
    const cart = await cartService.getCartWithProducts();
    return successResponse(cart);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch cart", [], 500);
  }
}

export async function DELETE() {
  try {
    await cartService.clearCart();
    return successResponse(null, "Cart cleared");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to clear cart", [], 500);
  }
}
