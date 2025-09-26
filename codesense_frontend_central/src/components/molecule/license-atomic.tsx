import { AxiosError } from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../atomic/button';

interface DownloadConfigOptions {
  licenseId: string;
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useDownloadLicenseConfig = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadConfig = async (options: DownloadConfigOptions) => {
    setIsDownloading(true);
    
    try {
      await downloadLicenseConfigWithAxios({
        ...options,
        onSuccess: () => {
          setIsDownloading(false);
          options.onSuccess?.();
        },
        onError: (error) => {
          setIsDownloading(false);
          options.onError?.(error);
        }
      });
    } catch (error) {
      setIsDownloading(false);
      throw error;
    }
  };

  return {
    downloadConfig,
    isDownloading
  };
};


export const downloadLicenseConfigWithAxios = async ({
  licenseId,
  filename = `license-config-${licenseId}.json`,
  onSuccess,
  onError
}: DownloadConfigOptions): Promise<void> => {
  try {
    const axios = (await import('axios')).default;
    
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/licenses/config/${licenseId}`, {
      responseType: 'blob',
      headers: {
        // Add any auth headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Configuration file downloaded successfully');
    onSuccess?.();
    
  } catch (error) {
    let errorMessage = 'Failed to download configuration file';
    
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data?.detail || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error('Download failed', {
      description: errorMessage,
    });
    
    onError?.(errorMessage);
    console.error('Config download error:', error);
  }
};

export const DownloadConfigButton = ({ licenseId }: { licenseId: string }) => {
  const { downloadConfig, isDownloading } = useDownloadLicenseConfig();
  
  const handleDownload = () => {
    downloadConfig({
      licenseId,
      filename: `license-${licenseId}-config.json`,
      onSuccess: () => {
        console.log('Download completed successfully');
      },
      onError: (error) => {
        console.error('Download failed:', error);
      }
    });
  };
  
  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading}
    >
      {isDownloading ? 'Downloading...' : 'Download Config'}
    </Button>
  );
};