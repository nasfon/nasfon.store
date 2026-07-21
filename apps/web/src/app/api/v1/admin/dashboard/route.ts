import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as dashboardService from "@/services/admin/dashboard.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const dashboard = await dashboardService.getDashboard();
    return successResponse(dashboard);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch dashboard", [], 500);
  }
}
