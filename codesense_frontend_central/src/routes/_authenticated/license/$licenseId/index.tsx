import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useDeleteLocalLicense, useLocalLicenseDetails } from '@/hooks/use-local';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atomic/card';
import { Progress } from '@/components/atomic/progress';
import { Button } from '@/components/atomic/button';
import { StateBadge } from '@/components/atomic/enum-badge';
import { ConfirmDialog } from '@/components/atomic/dialog-confirm';
import { formatTimestamp } from '@/utils/timestampFormater';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { 
  Calendar, 
  Users, 
  Scan, 
  Server, 
  Key, 
  Clock, 
  Mail, 
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Edit
} from 'lucide-react';
import { useState } from 'react';
import { DownloadConfigButton } from '@/components/molecule/license-atomic';

export const Route = createFileRoute('/_authenticated/license/$licenseId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { licenseId } = useParams({ from: '/_authenticated/license/$licenseId/' });
  const { data, isLoading, error } = useLocalLicenseDetails(licenseId);
  const deleteLocalMutation = useDeleteLocalLicense();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(false);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading license details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive text-lg font-medium">Error loading license</p>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium">No license found</p>
        <p className="text-muted-foreground">The requested license could not be found</p>
      </div>
    </div>
  );

  const { client, status, expiry_date, days_left, scans, users, local } = data;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleDeleteLocal = async () => {
    try {
      await deleteLocalMutation.mutateAsync(local.id);
      toast.success("Local license deleted successfully");
      navigate({ to: '/license/list' });
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error("Failed to delete local license", {
          description: error.response.data.detail,
        });
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const copyPublicKey = async () => {
    try {
      await navigator.clipboard.writeText(local.public_key);
      setCopiedKey(true);
      toast.success("Public key copied to clipboard");
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      toast.error("Failed to copy public key");
    }
  };

  const formatExpiryDate = (date: string) => {
    const expiryDate = new Date(date);
    return expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 7) return 'text-destructive';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">License Details</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your license configuration
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusIcon(status)}
          <StateBadge state={status} />
          <Button variant="outline" onClick={() => navigate({to: `/license/${licenseId}/edit`})}>
            <Edit/>
            Edit License
          </Button>
        </div>
      </div>

      {/* Client & License Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Client Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-lg font-semibold">{client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{client.contact_email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>License Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expires On</label>
              <p className="text-lg font-semibold">{formatExpiryDate(expiry_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
              <p className={`text-2xl font-bold ${getDaysLeftColor(days_left)}`}>
                {days_left} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scan className="h-5 w-5" />
                <span>Scans Usage</span>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(scans.percentage)}`}>
                {scans.percentage.toFixed(1)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {scans.used.toLocaleString()}</span>
              <span>Limit: {scans.limit.toLocaleString()}</span>
            </div>
            <Progress value={scans.percentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {(scans.limit - scans.used).toLocaleString()} scans remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users Usage</span>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(users.percentage)}`}>
                {users.percentage.toFixed(1)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {users.used}</span>
              <span>Limit: {users.limit}</span>
            </div>
            <Progress value={users.percentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {users.limit - users.used} user slots available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Local License Details */}
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Local License Configuration</span>
          </CardTitle>
          <DownloadConfigButton licenseId={licenseId}/>
        </CardHeader>
        <CardContent className="space-y-6">
          {local ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Local ID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{local.local_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Machine UUID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{local.machine_uuid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center space-x-2 pt-2">
                    {getStatusIcon(local.status)}
                    <StateBadge state={local.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Created</span>
                  </label>
                  <p className="text-sm">{formatTimestamp(local.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last Updated</span>
                  </label>
                  <p className="text-sm">{formatTimestamp(local.updated_at)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2 mb-2">
                  <Key className="h-4 w-4" />
                  <span>Public Key</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPublicKey}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedKey ? 'Copied!' : 'Copy'}
                  </Button>
                </label>
                <div className="relative">
                  <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border">
                    {local.public_key}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this local license configuration
                    </p>
                  </div>
                  <ConfirmDialog
                    trigger={
                      <Button 
                        variant="destructive" 
                        disabled={deleteLocalMutation.isPending}
                      >
                        {deleteLocalMutation.isPending ? 'Deleting...' : 'Delete Local License'}
                      </Button>
                    }
                    title="Delete Local License"
                    description="This action cannot be undone. The local license will be permanently deleted from the system."
                    confirmLabel="Delete License"
                    cancelLabel="Cancel"
                    confirmText={local.local_id}
                    onConfirm={handleDeleteLocal}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                  <Server className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Local Server Linked</h3>
                  <p className="text-muted-foreground max-w-md">
                    This license doesn't have a local server configuration yet. 
                    Local servers enable offline functionality and enhanced security.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                  <Button variant="outline" onClick={() => navigate({ to: '/license/list' })}>
                    Back to Licenses
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}