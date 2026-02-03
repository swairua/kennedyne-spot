import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function GAStatusIndicator() {
  const [isGAWorking, setIsGAWorking] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const hasGtag = typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function';
    
    setIsGAWorking(!!gaId && hasGtag);
  }, []);

  if (isGAWorking === null) return null;

  return (
    <>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg ${
          isGAWorking
            ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900'
            : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900'
        }`}
        title="Click to see GA status details"
      >
        {isGAWorking ? (
          <CheckCircle className="h-6 w-6" />
        ) : (
          <AlertCircle className="h-6 w-6" />
        )}
        <span>{isGAWorking ? 'GA OK' : 'GA Issues'}</span>
      </button>

      {showDetails && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-background border-2 border-border rounded-lg shadow-xl p-6 text-sm space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Google Analytics Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-muted-foreground hover:text-foreground text-lg"
            >
              ✕
            </button>
          </div>

          {isGAWorking ? (
            <div className="space-y-2 text-green-700 dark:text-green-300">
              <p className="flex items-center gap-2"><span>✓</span> GA4 ID: {import.meta.env.VITE_GA_MEASUREMENT_ID}</p>
              <p className="flex items-center gap-2"><span>✓</span> gtag function available</p>
              <p className="flex items-center gap-2"><span>✓</span> dataLayer initialized</p>
              <p className="text-muted-foreground mt-3 font-medium">✓ Google Analytics is working correctly</p>
            </div>
          ) : (
            <div className="space-y-2 text-red-700 dark:text-red-300">
              <p className="flex items-center gap-2"><span>✗</span> GA4 ID: {import.meta.env.VITE_GA_MEASUREMENT_ID || 'Not configured'}</p>
              <p className="flex items-center gap-2"><span>✗</span> gtag function: {typeof window.gtag}</p>
              <p className="text-muted-foreground mt-3 font-medium">Please check your GA configuration</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
