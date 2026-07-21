import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as customersService from "@/services/admin/customers.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const customers = await customersService.getAdminCustomers();
    return successResponse(customers);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch customers", [], 500);
  }
}
