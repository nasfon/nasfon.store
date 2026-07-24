import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminCustomerUpdateSchema } from "@/lib/validation";
import * as customersService from "@/services/admin/customers.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const customer = await customersService.getAdminCustomerById(id);
    return successResponse(customer);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Customer not found", [], 404);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(_request);
    if (error) return error;

    const { id } = await params;
    await customersService.deleteCustomer(id);
    return successResponse(null, "Customer deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete customer", [], 400);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = adminCustomerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const customer = await customersService.updateCustomer(id, parsed.data);
    return successResponse(customer, "Customer updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update customer", [], 400);
  }
}
