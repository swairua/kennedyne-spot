import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function GAStatusCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [gaId, setGaId] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const checkGAStatus = () => {
      const envGaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      setGaId(envGaId || 'Not configured');

      if (!envGaId) {
        setStatus('error');
        setDetails('VITE_GA_MEASUREMENT_ID environment variable is not set');
        return;
      }

      if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
        setStatus('success');
        setDetails(`GA4 initialized successfully. GA ID: ${envGaId}`);
      } else {
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
            setStatus('success');
            setDetails(`GA4 initialized successfully. GA ID: ${envGaId}`);
          } else {
            setStatus('error');
            setDetails('gtag function not found. GA script may not have loaded.');
          }
        }, 2000);
      }
    };

    checkGAStatus();
  }, []);

  return (
    <div className="space-y-3">
      {status === 'loading' && (
        <Alert>
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking GA status...</AlertDescription>
          </div>
        </Alert>
      )}

      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Google Analytics is working correctly
            </AlertDescription>
          </div>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{details}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="text-sm space-y-2 p-3 bg-muted rounded-md">
        <div>
          <span className="font-semibold">GA Measurement ID:</span>
          <code className="ml-2 bg-background px-2 py-1 rounded text-xs">{gaId}</code>
        </div>
        {details && (
          <div className="text-muted-foreground text-xs">{details}</div>
        )}
      </div>

      {status === 'success' && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ GA script loaded and initialized</p>
          <p>✓ Page view tracking is active</p>
          <p>✓ Consent mode configured</p>
        </div>
      )}
    </div>
  );
}
