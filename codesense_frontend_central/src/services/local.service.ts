// src/services/local-license.ts
import { BaseApiClient } from "@/lib/api";
import type {
  LocalLicenseDetails,
  CreateLocalLicenseDetails,
  UpdateLocalLicenseDetails,
  LocalLicenseListResponse,
  LicenseOverview
} from "@/types/local";

class LocalLicenseService extends BaseApiClient {
  async getLocalLicenseById(licenseId: string): Promise<LicenseOverview> {
    return this.get<LicenseOverview>(`api/local/license/${licenseId}`);
  }

  async createLocalLicense(data: CreateLocalLicenseDetails): Promise<LocalLicenseDetails> {
    return this.post<LocalLicenseDetails>("api/local/create/", data);
  }

  async updateLocalLicense(localId: string, data: UpdateLocalLicenseDetails): Promise<LocalLicenseDetails> {
    return this.put<LocalLicenseDetails>(`api/local/update/${localId}/`, data);
  }

  async getLocalLicenses(params?: { page?: number; limit?: number; search?: string }): Promise<LocalLicenseListResponse> {
    return this.get<LocalLicenseListResponse>("api/local/", params);
  }

  async deleteLocalLicense(localId: string): Promise<void> {
    return this.delete<void>(`api/local/delete/${localId}/`);
  }
}

export const localLicenseService = new LocalLicenseService();
