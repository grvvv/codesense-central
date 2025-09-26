// src/routes/_authenticated/License/new.tsx

import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/atomic/input';
import { useCreateLicense } from '@/hooks/use-license';
import { Card, CardHeader, CardTitle } from '@/components/atomic/card';

export const Route = createFileRoute('/_authenticated/license/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createLicenseMutation = useCreateLicense();

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    scans_limit: '',
    users_limit: '',
    expiry: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.client_name.trim()) newErrors.client_name = 'Client name is required';
    if (!formData.client_email.trim()) newErrors.client_email = 'Client email is required';
    if (!formData.scans_limit) newErrors.scans_limit = 'Scans limit is required';
    if (!formData.users_limit) newErrors.users_limit = 'Users limit is required';
    if (!formData.expiry.trim()) newErrors.expiry = 'Expiry date is required';
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
      };

      await createLicenseMutation.mutateAsync(licenseData);

      setFormData({
        client_name: '',
        client_email: '',
        scans_limit: '',
        users_limit: '',
        expiry: ''
      });

      navigate({ from: '/license/new', to: '../list' });
    } catch (error) {
      console.error('Error creating license:', error);
    }
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create License</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pt-0">
          {/* Client Name */}
          <div>
            <label className="block font-medium text-sm mb-1">Client Name</label>
            <Input
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              placeholder="Enter Client Name"
              className={`${errors.client_name ? 'border-destructive bg-destructive/10' : ''}`}
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
              placeholder="Enter Client Email"
              className={`${errors.client_email ? 'border-destructive bg-destructive/10' : ''}`}
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
              placeholder="Enter Scans Limit"
              className={`${errors.scans_limit ? 'border-destructive bg-destructive/10' : ''}`}
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
              placeholder="Enter Users Limit"
              className={`${errors.users_limit ? 'border-destructive bg-destructive/10' : ''}`}
            />
            {errors.users_limit && <p className="text-sm text-red-600 mt-1">{errors.users_limit}</p>}
          </div>

          {/* Expiry */}
          <div>
            <label className="block font-medium text-sm mb-1">Expiry Date</label>
            <Input
              type="datetime-local"
              name="expiry"
              value={formData.expiry}
              onChange={handleInputChange}
              className={`${errors.expiry ? 'border-destructive bg-destructive/10' : ''}`}
            />
            {errors.expiry && <p className="text-sm text-red-600 mt-1">{errors.expiry}</p>}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded shadow cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2">
                Create License
              </div>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
