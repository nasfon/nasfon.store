import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { getPaymentByReference } from "@/services/payment.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const result = await getPaymentByReference(reference);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment not found", [], 404);
  }
}
