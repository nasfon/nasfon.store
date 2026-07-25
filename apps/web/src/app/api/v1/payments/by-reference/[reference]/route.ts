import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { z } from "zod";
import { getPaymentByReference } from "@/services/payment.service";

const referenceSchema = z.string().min(1).max(100);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const parsed = referenceSchema.safeParse(reference);
    if (!parsed.success) return errorResponse("Invalid reference");
    const result = await getPaymentByReference(reference);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment not found", [], 404);
  }
}
