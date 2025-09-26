export interface FindingDetails {
  id: string;
  scan_id: string;
  created_by: string;
  cwe: string;
  cvss_vector: string;
  cvss_score: string;
  code: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file_path: string;
  code_snip: string;
  security_risk: string;
  mitigation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'false-positive';
  deleted: boolean;
  approved: boolean;
  reference: string;
  created_at: string;
  updated_at?: string; // Optional since it wasn't in the provided schema
}

export interface CreateFindingDetails {
  scan_id: string;
  cwe: string;
  cvss_vector: string;
  cvss_score: string;
  code: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file_path?: string;
  code_snip?: string;
  security_risk: string;
  mitigation: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed' | 'false-positive';
  reference?: string;
}

export interface UpdateFindingDetails {
  cwe?: string;
  cvss_vector?: string;
  cvss_score?: string;
  code?: string;
  title?: string;
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file_path?: string;
  code_snip?: string;
  security_risk?: string;
  mitigation?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed' | 'false-positive';
  approved?: boolean;
  reference?: string;
}

export interface FindingListResponse {
  findings: FindingDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Additional utility types
export type FindingSeverity = FindingDetails['severity'];
export type FindingStatus = FindingDetails['status'];

// For filtering/search params
export interface FindingFilters {
  scan_id?: string;
  severity?: FindingSeverity[];
  status?: FindingStatus[];
  cwe?: string;
  approved?: boolean;
  deleted?: boolean;
  created_by?: string;
  search?: string; // For searching in title, description, etc.
}

// For sorting
export interface FindingSortOptions {
  field: keyof FindingDetails;
  direction: 'asc' | 'desc';
}

export interface FindingQueryParams extends FindingFilters {
  page?: number;
  limit?: number;
  sort?: FindingSortOptions;
}