
import { licenseService } from '@/services/license.service';
import type { CreateLicenseDetails } from '@/types/license';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useLicenseDetails(licenseId: string) {
  return useQuery({
    queryKey: ['licenses', licenseId],
    queryFn: () => licenseService.getLicenseById(licenseId),
    enabled: !!licenseId,
  });
}

export function useUpdateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ licenseId, licenseData }: { licenseId: string; licenseData: any }) =>
      licenseService.updateLicense(licenseId, licenseData),
    onSuccess: (data) => {
      queryClient.setQueryData(['licenses', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['licenses', 'list'] });
    },
  });
}

export function useDeleteLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (licenseId: string) =>
      licenseService.deleteLicense(licenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (licenseData: CreateLicenseDetails) => licenseService.createLicense(licenseData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['licenses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['licenses', 'names'] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

export function useLicenseNames() {
  return useQuery({
    queryKey: ['licenses', 'names'],
    queryFn: () => licenseService.getNames(),
  });
}

export function useLicenses(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['licenses', 'list', params],
    queryFn: () => licenseService.getLicensesList(params),
  });
}
