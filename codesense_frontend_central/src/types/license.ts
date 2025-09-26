// src/types/license.ts
type LimitParams = {
  scans: number;
  users: number
}

export interface LicenseDetails {
  id: string;
  client: {
    name: string,
    contact_email: string
  };
  limits: LimitParams;
  usage: LimitParams;
  status: "active" | "revoked" | "expired";
  expiry: string; // ISO string
  created_at: string;
  updated_at: string;
}

// For creating a license
export interface CreateLicenseDetails {
  client_name: string;
  client_email: string;
  scans_limit: number;
  users_limit: number;
  expiry: string; // ISO string
}

// For updating a license (all optional)
export interface UpdateLicenseDetails {
  client_name?: string;
  client_email?: string;
  scans_limit?: number | undefined;
  users_limit?: number | undefined;
  status? : "active" | "revoked" | "expired" | undefined;
  expiry?: string; // ISO string
}

// API response for listing licenses
export interface LicenseListResponse {
  licenses: LicenseDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

