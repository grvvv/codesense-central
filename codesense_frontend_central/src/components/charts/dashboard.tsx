import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atomic/card';
import { Badge } from '@/components/atomic/badge';
import { Progress } from '@/components/atomic/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atomic/select";
import {
  Users,
  Shield,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scan,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
 
const LicenseDashboard = ({ data : licenseData} : { data: any }) => {
  console.log(licenseData)
  const [selectedClient, setSelectedClient] = useState(licenseData[0].client.name);
 
  const getStatusColor = (status: 'active' | 'revoked' | 'expired') => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'revoked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
 
  const getStatusIcon = (status: 'active' | 'revoked' | 'expired') => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'revoked': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };
 
  const getDaysLeftColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };
 
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
 

  // Calculate summary stats for all clients
  const totalClients = licenseData.length;
  const activeClients = licenseData.filter(l => l.status === 'active').length;
  const revokedClients = licenseData.filter(l => l.status === 'revoked').length;
  const expiredClients = licenseData.filter(l => l.status === 'expired').length;
  const totalUsers = licenseData.reduce((sum, l) => sum + l.users.used, 0);
  const totalScans = licenseData.reduce((sum, l) => sum + l.scans.used, 0);
 
  // Get selected client data
  const selectedClientData = selectedClient
    ? licenseData.find(license => license.client.name === selectedClient)
    : null;
 
  return (
    <div className=" p-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">License Management</h1>
            <p className="mt-1">Monitor and manage client licenses</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Last updated</p>
            <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
 
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <div className="flex space-x-4 mt-2">
                <span className="text-xs text-green-600">Active: {activeClients}</span>
                <span className="text-xs text-yellow-600">revoked: {revokedClients}</span>
                <span className="text-xs text-red-600">Expired: {expiredClients}</span>
              </div>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Across all licenses</p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">Scans performed</p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {licenseData.filter(l => l.days_left <= 30 && l.days_left > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Main License Card */}
        <Card className="lg:col-span-2">
        <CardHeader>
            <div className="flex items-center justify-between">
                {/* Left: Dynamic title */}
                <div>
                {selectedClientData ? (
                    <>
                    <CardTitle className="text-lg">
                        {selectedClientData.client.name}
                    </CardTitle>
                    <CardDescription className="text-md mt-1">
                      {selectedClientData.client.contact_email}
                    </CardDescription>
                    </>
                ) : (
                    <>
                    <CardTitle className="text-lg">License Details</CardTitle>
                    <CardDescription className="text-md mt-1">
                        Manage and monitor client license usage
                    </CardDescription>
                    </>
                )}
                </div>
 
                {/* Right: Client Selector */}
                <div className="flex items-center gap-4">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent>
                    {licenseData.map((license, index) => (
                        <SelectItem key={index} value={license.client.name}>
                        {license.client.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
 
                {/* Show status only when client is selected */}
                {selectedClientData && (
                    <Badge
                    className={`${getStatusColor(
                        selectedClientData.status
                    )} flex items-center gap-2 text-sm px-4 py-2`}
                    >
                    {getStatusIcon(selectedClientData.status)}
                    {selectedClientData.status.toUpperCase()}
                    </Badge>
                )}
                </div>
            </div>
        </CardHeader>
 
 
        {selectedClientData && (
            <CardContent className="grid md:grid-cols-2 gap-6">
            {/* Left Column - License Details */}
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">License Expiry</span>
                </div>
                <p className="text-lg font-semibold">
                    {selectedClientData.expiry_date}
                </p>
                <p
                    className={`text-sm ${getDaysLeftColor(
                    selectedClientData.days_left
                    )}`}
                >
                    {selectedClientData.days_left < 0
                    ? `Expired ${Math.abs(selectedClientData.days_left)} days ago`
                    : `${selectedClientData.days_left} days remaining`}
                </p>
                </div>
 
                <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Local Instances</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                    {selectedClientData.locals.total}
                </p>
                <p className="text-sm text-blue-600">Active instances</p>
                </div>
            </div>
 
            {/* Right Column - Usage Statistics */}
            <div className="space-y-4">
                {/* Scans Usage */}
                <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2 font-medium">
                    <Scan className="w-5 h-5" />
                    Scans Usage
                    </span>
                    <span className="text-md font-bold">
                    {selectedClientData.scans.used}/{selectedClientData.scans.limit}
                    </span>
                </div>
                <Progress
                    value={selectedClientData.scans.percentage}
                    className="h-3 mb-2"
                    style={{
                    ["--progress-background" as any]: getProgressColor(
                        selectedClientData.scans.percentage
                    ),
                    }}
                />
                <p className="text-sm text-muted-foreground">
                    {selectedClientData.scans.percentage.toFixed(1)}% of limit utilized
                </p>
                </div>
 
                {/* Users Usage */}
                <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2 font-medium">
                    <Users className="w-5 h-5" />
                    Users
                    </span>
                    <span className="text-md font-bold">
                    {selectedClientData.users.used}/{selectedClientData.users.limit}
                    </span>
                </div>
                <Progress
                    value={selectedClientData.users.percentage}
                    className="h-3 mb-2"
                    style={{
                    ["--progress-background" as any]: getProgressColor(
                        selectedClientData.users.percentage
                    ),
                    }}
                />
                <p className="text-sm text-muted-foreground">
                    {selectedClientData.users.percentage.toFixed(1)}% of limit utilized
                </p>
                </div>
            </div>
            </CardContent>
        )}
        </Card>
 
        <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
            <CardTitle>License Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={licenseData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="client.name" tick={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans.percentage" fill="#E30220" name="Scans %">
                    <LabelList dataKey="scans.percentage" position="top" />
                </Bar>
                <Bar dataKey="users.percentage" fill="#660A0A" name="Users %">
                    <LabelList dataKey="users.percentage" position="top" />
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};
 
export default LicenseDashboard;
 