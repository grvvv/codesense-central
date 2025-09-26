import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { GenericTable, type TableColumn } from '@/components/molecule/generic-table';
import { Button } from '@/components/atomic/button';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatTimestamp } from '@/utils/timestampFormater';
import { useDeleteLicense, useLicenses } from '@/hooks/use-license';
import type { LicenseDetails } from '@/types/license';
import { ConfirmDialog } from '@/components/atomic/dialog-confirm';

export const Route = createFileRoute('/_authenticated/license/list')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data: LicenseResponse, isLoading, error } = useLicenses({
    page: currentPage,
    limit: usersPerPage,
  });
  const deletedLicenseMutation = useDeleteLicense();

  const licenses = LicenseResponse?.licenses || [];
  const totalLicenses = LicenseResponse?.pagination.total || 0;

  const LicenseColumns: TableColumn<LicenseDetails>[] = [
    {
      key: 'srNo',
      header: 'Sr No.',
      render: (_, index: number) => index + 1,
      width: '80px',
    },
    {
      key: 'client.name',
      header: 'Client Name',
      sortable: true,
    },
    {
      key: 'client.contact_email',
      header: 'Client Email',
      sortable: true,
    },
    {
      key: 'limits.scans',
      header: 'Scans Limit',
      render: (license) => <p>{license.limits.scans}</p>,
    },
    {
      key: 'status',
      header: 'Status',
    },
    {
      key: 'expiry',
      header: 'Expiry',
      render: (license) => <p>{formatTimestamp(license.expiry)}</p>,
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (license) => <p>{formatTimestamp(license.created_at)}</p>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (license) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(license);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            }
            title="Delete License"
            description="This action cannot be undone. This will permanently delete the license."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            confirmText={license.client.name}
            onConfirm={() => handleDelete(license)}
          />
        </div>
      ),
      width: '150px',
    },
  ];

  const handleEdit = (license: LicenseDetails) => {
    navigate({ from: '/license/list', to: `../${license.id}/edit` });
  };

  const handleDelete = async (license: LicenseDetails) => {
    await deletedLicenseMutation.mutateAsync(license.id);
  };

  const handleRowClick = (license: LicenseDetails) => {
    navigate({ from: '/license/list', to: `../${license.id}` });
  };

  return (
    <GenericTable
      data={licenses}
      columns={LicenseColumns}
      title="Licenses List"
      loading={isLoading}
      error={error?.message}
      pagination={{
        enabled: true,
        pageSize: usersPerPage,
        showInfo: true,
        showPageNumbers: true,
      }}
      totalItems={totalLicenses}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      emptyMessage="No Licenses found"
      onRowClick={handleRowClick}
      rowClassName={() => `hover:bg-gray-50 hover:dark:bg-gray-300/10`}
    />
  );
}
