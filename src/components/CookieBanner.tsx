import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, X } from 'lucide-react';
import { useConsent, type ConsentState } from '@/hooks/useConsent';

export function CookieBanner() {
  const { showBanner, consent, acceptAll, rejectAll, saveConsent, hideBanner } = useConsent();
  const { t } = useI18n();
  const [showSettings, setShowSettings] = useState(false);
  const [tempConsent, setTempConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    functional: false,
    necessary: true,
  });

  // Initialize tempConsent with current consent state when banner appears
  useEffect(() => {
    if (showBanner && consent) {
      setTempConsent(consent);
      console.debug('[CookieBanner] Initialized with consent state', consent);
    }
  }, [showBanner, consent]);

  if (!showBanner) return null;

  const handleSaveSettings = () => {
    console.debug('[CookieBanner] Saving settings', tempConsent);
    saveConsent(tempConsent);
    setShowSettings(false);
  };

  const handleToggle = (key: keyof ConsentState) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setTempConsent(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      console.debug('[CookieBanner] Toggled consent', { key, newValue: updated[key] });
      return updated;
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
      <div className="container max-w-6xl mx-auto">
        {!showSettings ? (
          <Card className="p-6 border border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{t('cookie_preferences')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('cookie_message')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {t('customize')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                >
                  {t('reject_all')}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={acceptAll}
                >
                  {t('accept_all')}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">{t('cookie_settings')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">{t('necessary_cookies')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('necessary_cookies_desc')}
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">{t('analytics_cookies')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('analytics_cookies_desc')}
                  </p>
                </div>
                <Switch
                  checked={tempConsent.analytics}
                  onCheckedChange={() => handleToggle('analytics')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">{t('marketing_cookies')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('marketing_cookies_desc')}
                  </p>
                </div>
                <Switch
                  checked={tempConsent.marketing}
                  onCheckedChange={() => handleToggle('marketing')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">{t('functional_cookies')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('functional_cookies_desc')}
                  </p>
                </div>
                <Switch
                  checked={tempConsent.functional}
                  onCheckedChange={() => handleToggle('functional')}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempConsent({
                    analytics: false,
                    marketing: false,
                    functional: false,
                    necessary: true,
                  });
                  handleSaveSettings();
                }}
                className="flex-1"
              >
                {t('reject_all')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveSettings}
                className="flex-1"
              >
                {t('save_preferences')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
