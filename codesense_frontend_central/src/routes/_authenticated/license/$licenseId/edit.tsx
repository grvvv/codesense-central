// src/routes/_authenticated/License/$licenseId/edit.tsx

import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { Input } from '@/components/atomic/input';
import type { UpdateLicenseDetails } from '@/types/license';
import { useLicenseDetails, useUpdateLicense } from '@/hooks/use-license';
import { Card, CardHeader, CardTitle } from '@/components/atomic/card';
import { DotsLoader } from '@/components/atomic/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atomic/select';

export const Route = createFileRoute('/_authenticated/license/$licenseId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { licenseId } = useParams({ from: '/_authenticated/license/$licenseId/edit' });
  const updateLicenseMutation = useUpdateLicense();
  const { data: license, isLoading, error } = useLicenseDetails(licenseId);

  const [formData, setFormData] = useState<UpdateLicenseDetails>({
    client_name: '',
    client_email: '',
    scans_limit: 0,
    users_limit: 0,
    expiry: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Partial<UpdateLicenseDetails>>({});

  // Populate form with existing License data
  useEffect(() => {
    if (license) {
      const utcDate = new Date(license.expiry); // UTC from backend

      // Convert to IST by adding 5:30
      const istOffset = 5.5 * 60; // in minutes
      const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);

      // Format as 'YYYY-MM-DDTHH:MM' for datetime-local input
      const year = istDate.getFullYear();
      const month = String(istDate.getMonth() + 1).padStart(2, '0');
      const day = String(istDate.getDate()).padStart(2, '0');
      const hours = String(istDate.getHours()).padStart(2, '0');
      const minutes = String(istDate.getMinutes()).padStart(2, '0');

      const formattedExpiry = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        client_name: license.client.name || '',
        client_email: license.client.contact_email || '',
        scans_limit: license.limits.scans || 0,
        users_limit: license.limits.users || 0,
        expiry: formattedExpiry,
        status: license.status || 'active'
      });
    }
  }, [license]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof UpdateLicenseDetails]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as UpdateLicenseDetails['status'] }));
    
    // Clear error on select change
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }));
    }
  };
  const validateForm = (): boolean => {
    const newErrors: Partial<any> = {};
    if (!formData.client_name?.trim()) newErrors.client_name = 'Client name is required';
    if (!formData.client_email?.trim()) newErrors.client_email = 'Client email is required';
    if (!formData.scans_limit || formData.scans_limit <= 0) newErrors.scans_limit = 'Scans limit must be greater than 0';
    if (!formData.users_limit || formData.users_limit <= 0) newErrors.users_limit = 'Users limit must be greater than 0';
    if (!formData.expiry) newErrors.expiry = 'Expiry date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const licenseData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        scans_limit: Number(formData.scans_limit),
        users_limit: Number(formData.users_limit),
        expiry: new Date(formData.expiry).toISOString(),
        status: formData.status
      };

      await updateLicenseMutation.mutateAsync({ licenseId, licenseData });
      navigate({ from: '/license/$licenseId/edit', to: '../../list' });
    } catch (error) {
      console.error('Error updating License:', error);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/license/list' });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <DotsLoader />
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Error</CardTitle>
          </CardHeader>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {error ? 'Failed to load License details.' : 'License not found.'}
            </p>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
            >
              Back to Licenses
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit License</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pt-0 pb-6">
          {/* Client Name */}
          <div>
            <label className="block font-medium text-sm mb-1">Client Name</label>
            <Input
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              className={`${errors.client_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Enter Client Name"
            />
            {errors.client_name && <p className="text-sm text-red-600 mt-1">{errors.client_name}</p>}
          </div>

          {/* Client Email */}
          <div>
            <label className="block font-medium text-sm mb-1">Client Email</label>
            <Input
              type="email"
              name="client_email"
              value={formData.client_email}
              onChange={handleInputChange}
              className={`${errors.client_email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Enter Client Email"
            />
            {errors.client_email && <p className="text-sm text-red-600 mt-1">{errors.client_email}</p>}
          </div>

          {/* Scans Limit */}
          <div>
            <label className="block font-medium text-sm mb-1">Scans Limit</label>
            <Input
              type="number"
              name="scans_limit"
              value={formData.scans_limit}
              onChange={handleInputChange}
              className={`${errors.scans_limit ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Enter Scans Limit"
            />
            {errors.scans_limit && <p className="text-sm text-red-600 mt-1">{errors.scans_limit}</p>}
          </div>

          {/* Users Limit */}
          <div>
            <label className="block font-medium text-sm mb-1">Users Limit</label>
            <Input
              type="number"
              name="users_limit"
              value={formData.users_limit}
              onChange={handleInputChange}
              className={`${errors.users_limit ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Enter Users Limit"
            />
            {errors.users_limit && <p className="text-sm text-red-600 mt-1">{errors.users_limit}</p>}
          </div>

          {/* Expiry */}
          <div>
            <label className="block font-medium text-sm mb-1">Expiry</label>
            <Input
              type="datetime-local"
              name="expiry"
              value={formData.expiry}
              onChange={handleInputChange}
              className={`${errors.expiry ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.expiry && <p className="text-sm text-red-600 mt-1">{errors.expiry}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium text-sm mb-1">Status</label>
            <Select 
              value={formData.status || undefined} // Convert empty string to undefined for proper placeholder display
              onValueChange={handleSelectChange}
              disabled={updateLicenseMutation.isPending}
            >
              <SelectTrigger className={`${
                errors.status ? 'border-destructive bg-destructive/10' : ''
              }`}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoke</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updateLicenseMutation.isPending}
              className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold py-3 rounded shadow cursor-pointer disabled:cursor-not-allowed"
            >
              {updateLicenseMutation.isPending ? 'Updating...' : 'Update License'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded shadow cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
