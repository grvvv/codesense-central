export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export type PermissionRole = 'user' | 'manager'

export interface AllPermissions {
    create_project: boolean;
    delete_project: boolean;
    update_project: boolean;
    view_projects: boolean;
    view_scans: boolean;
    create_scan: boolean;
    update_scan: boolean;
    delete_scan: boolean;
    view_findings: boolean;
    validate_finding: boolean;
    delete_finding: boolean;
    create_report: boolean;
    update_report: boolean;
    delete_report: boolean;
    view_reports: boolean;
}

export interface RolePermissions {
  role: PermissionRole;
  permissions: AllPermissions;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
}

export interface UpdateUserCredentials {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'user';
}

export interface AuthResponse {
  user: User;
  token: string;
}