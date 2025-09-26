import { BaseApiClient } from "@/lib/api";
import type { CreateLicenseDetails, LicenseDetails, LicenseListResponse, UpdateLicenseDetails } from "@/types/license";

class LicenseService extends BaseApiClient {
  async getLicenseById(licenseId: string): Promise<LicenseDetails> {
    return this.get<LicenseDetails>(`api/licenses/${licenseId}`);
  }

  async getNames(): Promise<{id: string, name: string}[]> {
    return this.get<{id: string, name: string}[]>(`api/licenses/names`);
  }

  async createLicense(data: CreateLicenseDetails): Promise<LicenseDetails> {
    return this.post<LicenseDetails>(`api/licenses/create/`, data);
  }

  async updateLicense(licenseId: string, data: UpdateLicenseDetails): Promise<LicenseDetails> {
    return this.patch<LicenseDetails>(`api/licenses/${licenseId}/`, data);
  }

  async getLicensesList(params?: { page?: number; limit?: number; search?: string }): Promise<LicenseListResponse> {
    return this.get<any>('api/licenses/', params);
  }

  async deleteLicense(licenseId: string): Promise<void> {
    return this.delete<void>(`api/licenses/${licenseId}/`);
  }
}

export const licenseService = new LicenseService();