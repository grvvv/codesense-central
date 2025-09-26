// src/types/local-license.ts

export interface LocalLicenseDetails {
  id: string; // maps from MongoDB _id
  license_id: string; // MongoDB ObjectId as string
  local_id: string;
  public_key: string;
  machine_uuid: string;
  status: "active" | "revoked" | "expired";
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface LicenseOverview {
  client: {
    name: string;
    contact_email: string;
  };
  status: string;
  expiry_date: string;   // ISO date string
  days_left: number;
  scans: UsageStat;
  users: UsageStat;
  local: LocalLicenseDetails;
}

export interface UsageStat {
  used: number;
  limit: number;
  percentage: number;
}

export interface CreateLocalLicenseDetails {
  license_id: string;
  local_id: string;
  public_key: string;
  machine_uuid: string;
}

export interface UpdateLocalLicenseDetails {
  status?: "active" | "revoked" | "expired";
  public_key?: string;
}

export interface LocalLicenseListResponse {
  local_licenses: LocalLicenseDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
