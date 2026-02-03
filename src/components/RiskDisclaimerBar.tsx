import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, ExternalLink } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from "@/components/GTMProvider";
import { useI18n } from '@/i18n';

export function RiskDisclaimerBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  // Legal pages where we don't show the risk notice
  const legalPages = ['/risk-disclaimer', '/privacy-policy', '/terms-of-use', '/affiliate-disclosure'];
  const shouldHide = legalPages.includes(location.pathname);

  // Check localStorage on mount
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('riskDisclaimerDismissedUntil');
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('riskDisclaimerDismissedUntil');
      }
    }
  }, []);

  const handleDismiss = () => {
    trackEvent('risk_disclaimer_dismissed', { source: 'floating_chip' });
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 14); // 14 days from now
    localStorage.setItem('riskDisclaimerDismissedUntil', dismissUntil.toISOString());
    setIsDismissed(true);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    trackEvent('risk_disclaimer_expanded', { source: 'floating_chip' });
    setIsExpanded(true);
  };

  if (shouldHide || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 md:right-24 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {!isExpanded ? (
        // Collapsed state - compact chip
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpand}
          className="bg-background/80 backdrop-blur-sm border-border shadow-md hover:bg-background/90 text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <AlertTriangle className="w-3 h-3 mr-1.5 opacity-60" />
          {t('risk_notice_chip')}
        </Button>
      ) : (
        // Expanded state - card with full message
        <Card className="w-80 bg-popover/95 backdrop-blur-sm border-border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-muted-foreground opacity-60" />
                <span className="text-sm font-medium text-foreground">{t('risk_notice_title')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('risk_notice_message')}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 text-xs"
              >
                <Link to="/risk-disclaimer" className="flex items-center">
                  {t('learn_more')}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 text-xs"
              >
                {t('dismiss')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
