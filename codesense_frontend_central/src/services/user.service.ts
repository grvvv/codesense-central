import { BaseApiClient } from "@/lib/api";
import type { RegisterCredentials, UpdateUserCredentials } from "@/types/auth";
import type { UserListResponse, UserProfile } from "@/types/user";

class UserService extends BaseApiClient {
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.get<UserProfile>(`/auth/users/${userId}/`);
  }

  async createProfile(data: RegisterCredentials): Promise<UserProfile> {
    return this.post<UserProfile>(`/auth/register/`, data);
  }

  async updateProfile(userId: string, data: UpdateUserCredentials): Promise<UserProfile> {
    return this.patch<UserProfile>(`/auth/users/update/${userId}/`, data);
  }

  async getUsersList(params?: { page?: number; limit?: number; search?: string }): Promise<UserListResponse> {
    return this.get<UserListResponse>('/auth/users/', params);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete<void>(`/auth/users/delete/${userId}/`);
  }
}

export const userService = new UserService();