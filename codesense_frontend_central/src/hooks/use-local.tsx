// src/hooks/useLocalLicenses.ts
import { localLicenseService } from '@/services/local.service';
import type { CreateLocalLicenseDetails, UpdateLocalLicenseDetails } from '@/types/local';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useLocalLicenseDetails(license_id: string) {
  return useQuery({
    queryKey: ['license', 'local', license_id],
    queryFn: () => localLicenseService.getLocalLicenseById(license_id),
    enabled: !!license_id,
  });
}

export function useLocalLicenses(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['local', 'list', params],
    queryFn: () => localLicenseService.getLocalLicenses(params),
  });
}

export function useDeleteLocalLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localId: string) =>
      localLicenseService.deleteLocalLicense(localId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local', 'list'] });
    },
  });
}

export function useCreateLocalLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localData: CreateLocalLicenseDetails) =>
      localLicenseService.createLocalLicense(localData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to create local license:', error);
    },
  });
}

export function useUpdateLocalLicense(localId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localData: UpdateLocalLicenseDetails) =>
      localLicenseService.updateLocalLicense(localId, localData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local', localId] });
      queryClient.invalidateQueries({ queryKey: ['local', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to update local license:', error);
    },
  });
}
