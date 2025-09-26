import type { ScanDetails } from '@/types/local';
import { formatTimestamp } from '@/utils/timestampFormater';
import { Clock, FileText, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScanUpdateProps {
  scan?: ScanDetails;
}

function ScanUpdate({ scan }: ScanUpdateProps) {
  // Default scan data for demo purposes
  const defaultScan: ScanDetails = {
    id: "6895a4aafd752429c18740bb",
    project_id: "68874418e816acffbf7c7729",
    scan_name: "HDBFS",
    status: "in_progress",
    created_at: "2025-08-08T07:18:02.223",
    triggered_by: "68863cf8ee93d4964a00d585",
    total_files: 353,
    files_scanned: 2,
    findings: 2,
    end_time: null
  };

  const phases = [
    { name: 'Initializing Scan', start: 0, end: 5 },
    { name: 'Scanning Files', start: 5, end: 80 },
    { name: 'Analyzing Results', start: 80, end: 95 },
    { name: 'Generating Report', start: 95, end: 100 }
  ];

  // Calculate percentage based on files scanned vs total files
  const calculatePercentage = (scan: ScanDetails): number => {
    if (scan.status === 'completed') return 100;
    if (scan.status === 'failed' || scan.status === 'cancelled') return 0;
    if (scan.total_files === 0) return 0;
    
    return Math.min((scan.files_scanned / scan.total_files) * 100, 99);
  };

  // Determine current phase based on percentage
  const getCurrentPhase = (percentage: number): string => {
    if (currentScan.status === 'completed') return 'Scan Complete';
    if (currentScan.status === 'failed') return 'Scan Failed';
    if (currentScan.status === 'cancelled') return 'Scan Cancelled';
    if (currentScan.status === 'pending') return 'Waiting to Start';
    
    const phase = phases.find(p => percentage >= p.start && percentage < p.end);
    return phase ? phase.name : 'Scanning Files';
  };

  const currentScan = scan || defaultScan;
  const percentage = calculatePercentage(currentScan);
  const currentPhase = getCurrentPhase(percentage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full">
      {/* Scan Header */}
      <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">{currentScan.scan_name}</h2>
            <p className="text-sm text-muted-foreground">Scan ID: {currentScan.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(currentScan.status)}
            <span className={`text-sm font-medium capitalize ${getStatusColor(currentScan.status)}`}>
              {currentScan.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-50 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{currentScan.total_files}</div>
            <div className="text-sm text-blue-600 dark:text-blue-50">Total Files</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-50 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{currentScan.files_scanned}</div>
            <div className="text-sm text-green-600 dark:text-green-50">Files Scanned</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-50 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{currentScan.findings}</div>
            <div className="text-sm text-orange-600 dark:text-orange-50">Findings</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
            <Clock className="w-8 h-8 text-gray-600 dark:text-gray-50 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Started</div>
            <div className="text-xs text-gray-600 dark:text-gray-50">{formatTimestamp(currentScan.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="rounded-lg shadow-sm border p-6">
        <div className="text-center">
          {/* Circular Progress */}
          <div className="relative mb-6">
            <svg className="w-48 h-48 mx-auto transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#e5e5e5"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke={currentScan.status === 'completed' ? '#10b981' : currentScan.status === 'failed' ? '#ef4444' : '#3b82f6'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
              {/* Animated Dots - only show when in progress */}
              {currentScan.status === 'in_progress' && (
                <circle cx="100" cy="10" r="3" fill="#3b82f6" className="animate-pulse">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 100 100;360 100 100"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
            
            {/* Percentage Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-1">
                  {Math.round(percentage)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>

          {/* Current Phase */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{currentPhase}</h3>
            {currentScan.status === 'in_progress' && (
              <p className="text-sm text-muted-foreground mb-4">
                Processing {currentScan.files_scanned} of {currentScan.total_files} files
              </p>
            )}
            {currentScan.status === 'completed' && (
              <p className="text-sm text-green-600 mb-4">
                Scan completed successfully at {currentScan.end_time ? formatTimestamp(currentScan.end_time) : 'Unknown'}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                currentScan.status === 'completed' ? 'bg-green-500' : 
                currentScan.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* ETA or completion time */}
          {currentScan.status === 'in_progress' && currentScan.files_scanned > 0 && (
            <div className="text-sm">
              {currentScan.total_files - currentScan.files_scanned} files remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanUpdate;