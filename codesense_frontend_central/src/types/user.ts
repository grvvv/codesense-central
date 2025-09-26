export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
}

export interface UserListResponse {
  users: UserProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}