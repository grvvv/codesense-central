import { BaseApiClient } from "@/lib/api";
import type { RolePermissions } from "@/types/auth";
// import type { DashboardResponse } from "@/types/dashboard";

class GeneralService extends BaseApiClient {
  async fetchDashboard(): Promise<any> {
    return this.get<any>('/api/dashboard/');
  }

  async fetchPermissionsByRole(role: "user" | "manager"): Promise<RolePermissions> {
    return this.get<RolePermissions>(`/auth/permissions/${role}`);
  }

  async updatePermissions(data: RolePermissions): Promise<RolePermissions> {
    return this.post<RolePermissions>('/auth/permissions/update/', data);
  }

  async fetchMyPermissions(): Promise<RolePermissions>{
    return this.get<RolePermissions>('/auth/permissions/me');
  }
}

export const generalService = new GeneralService();
