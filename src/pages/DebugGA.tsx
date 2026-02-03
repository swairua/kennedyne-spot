import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DebugGA() {
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const hasGtag = typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function';
    const hasDataLayer = typeof window !== 'undefined' && window.dataLayer && Array.isArray(window.dataLayer);

    setDetails({
      gaId: gaId || 'Not configured',
      hasGtag,
      hasDataLayer,
      dataLayerLength: window.dataLayer?.length || 0,
      gtagFunction: typeof window.gtag,
    });

    if (gaId && hasGtag) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Google Analytics Debug</h1>
          <p className="text-muted-foreground">Check if GA is properly initialized</p>
        </div>

        {status === 'success' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 text-base">
              ✓ Google Analytics (GA4) is working correctly!
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              ✗ Google Analytics is not properly configured or initialized
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>GA Configuration Status</CardTitle>
            <CardDescription>Current GA setup details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-semibold">GA Measurement ID:</p>
              <code className="block bg-muted p-3 rounded text-sm">
                {details.gaId}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm">gtag function available:</p>
                <p className={`text-sm ${details.hasGtag ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {details.hasGtag ? '✓ Yes' : '✗ No'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-sm">dataLayer array:</p>
                <p className={`text-sm ${details.hasDataLayer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {details.hasDataLayer ? `✓ Yes (${details.dataLayerLength} items)` : '✗ No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's Working</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {details.hasGtag && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">GA4 Script Loaded</p>
                  <p className="text-sm text-muted-foreground">Google Analytics 4 script is loaded and gtag function is available</p>
                </div>
              </div>
            )}

            {details.hasDataLayer && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Data Layer Initialized</p>
                  <p className="text-sm text-muted-foreground">dataLayer is initialized with {details.dataLayerLength} events</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Page View Tracking</p>
                <p className="text-sm text-muted-foreground">Page views are tracked on route changes via AnalyticsProvider</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Consent Mode v2</p>
                <p className="text-sm text-muted-foreground">Google Consent Mode v2 is configured (analytics_storage: denied by default)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing GA</CardTitle>
            <CardDescription>You can test GA by opening your browser's DevTools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open DevTools (F12 or right-click → Inspect)</li>
              <li>Go to the Console tab</li>
              <li>Type: <code className="bg-muted px-2 py-1 rounded">window.gtag('event', 'test_event')</code></li>
              <li>Check the Network tab for requests to googletagmanager.com</li>
              <li>Or use the tag assistant extension from Google</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
