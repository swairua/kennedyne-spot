import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ImageInput } from '@/components/ui/image-input';
import { supabase } from '@/integrations/supabase/client';
import { getSiteContent, updateSiteContent } from '@/content/siteContent';
import { GAStatusCheck } from '@/components/GAStatusCheck';
import { SocialLinksManager } from '@/components/admin/SocialLinksManager';

const SiteSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Site Information Settings
  const [siteInfo, setSiteInfo] = useState({
    siteName: 'KenneDyne spot',
    tagline: 'Master the Art of Trading',
    description: 'Professional trading education and mentorship',
    keywords: 'trading, forex, education, mentorship',
    favicon: '/favicon.ico',
    logo: '/logo.png',
  });

  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    email: 'info@kennedynespot.com',
    phone: '+1 (555) 123-4567',
    address: '123 Trading Street, Financial District',
    whatsapp: '+1 (555) 123-4567',
  });

  // Social Media Links
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    telegram: '',
  });

  // Analytics & Tracking
  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleTagManagerId: '',
    hotjarId: '',
  });

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    defaultTitle: 'KenneDyne spot - Professional Trading Education',
    defaultDescription: 'Master professional trading with our comprehensive education programs and mentorship.',
    canonicalUrl: 'https://kennedynespot.com/#/',
    robotsTxt: 'User-agent: *\nDisallow: /admin\nAllow: /',
    sitemap: true,
    defaultOgImage: '',
  });

  // Feature Toggles
  const [features, setFeatures] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    commentsEnabled: true,
    newsletterEnabled: true,
    cookieConsent: true,
  });

  // Payments (M-Pesa) settings
  const [payments, setPayments] = useState({
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaShortCode: '',
    mpesaPasskey: '',
    mpesaCallbackUrl: ''
  });

  // Load settings from database and siteContent
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from database
        const { data: siteSettings } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        // Load from siteContent
        const siteContent = getSiteContent();

        if (siteSettings) {
          setAnalytics({
            googleAnalyticsId: siteSettings.ga4_id || '',
            facebookPixelId: '',
            googleTagManagerId: siteSettings.gtm_id || '',
            hotjarId: '',
          });

          setSeoSettings({
            defaultTitle: siteContent.seo.title,
            defaultDescription: siteSettings.seo_default_description || siteContent.seo.description,
            canonicalUrl: 'https://kennedynespot.com/#/',
            robotsTxt: siteSettings.robots_content || 'User-agent: *\nDisallow: /admin\nAllow: /',
            sitemap: siteSettings.sitemap_enabled || true,
            defaultOgImage: siteSettings.seo_default_og_image || '',
          });

          setContactInfo({
            email: siteContent.footer.email,
            phone: siteContent.footer.phone,
            address: siteContent.pages.contact.address,
            whatsapp: siteSettings.whatsapp_number || siteContent.pages.contact.whatsapp,
          });

          // Load payments/mpesa credentials if present
          setPayments({
            mpesaConsumerKey: (siteSettings as any).mpesa_consumer_key || '',
            mpesaConsumerSecret: (siteSettings as any).mpesa_consumer_secret || '',
            mpesaShortCode: (siteSettings as any).mpesa_short_code || '',
            mpesaPasskey: (siteSettings as any).mpesa_passkey || '',
            mpesaCallbackUrl: (siteSettings as any).mpesa_callback_url || ''
          });
        }

        // Set site info from siteContent
        setSiteInfo({
          siteName: siteContent.navigation.brand,
          tagline: siteContent.hero.badge,
          description: siteContent.seo.description,
          keywords: siteContent.seo.keywords,
          favicon: '/favicon.ico',
          logo: '/logo.png',
        });

        // Set social media from siteContent
        const socials = siteContent.footer.socials;
        setSocialMedia({
          facebook: '',
          twitter: socials.find(s => s.type === 'x')?.href || '',
          instagram: '',
          linkedin: '',
          youtube: socials.find(s => s.type === 'youtube')?.href || '',
          telegram: socials.find(s => s.type === 'telegram')?.href || '',
        });

      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async (section: string, data: any) => {
    setLoading(true);
    try {
      if (section === 'analytics') {
        // Save analytics to database
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000', // Single row
            ga4_id: data.googleAnalyticsId,
            gtm_id: data.googleTagManagerId,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      if (section === 'seo') {
        // Save SEO settings to database
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000', // Single row
            seo_default_description: data.defaultDescription,
            seo_default_og_image: data.defaultOgImage,
            robots_content: data.robotsTxt,
            sitemap_enabled: data.sitemap,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      if (section === 'contact') {
        // Save WhatsApp to database
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000', // Single row
            whatsapp_number: data.whatsapp,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        // Update siteContent for contact info
        const siteContent = getSiteContent();
        updateSiteContent({
          ...siteContent,
          footer: {
            ...siteContent.footer,
            email: data.email,
            phone: data.phone
          },
          pages: {
            ...siteContent.pages,
            contact: {
              ...siteContent.pages.contact,
              email: data.email,
              phone: data.phone,
              address: data.address,
              whatsapp: data.whatsapp
            }
          }
        });
      }

      if (section === 'general') {
        // Update favicon in index.html if it changed
        if (data.favicon !== siteInfo.favicon) {
          // Update the favicon link in the document head
          const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (faviconLink) {
            faviconLink.href = data.favicon;
          }
        }

        // Update siteContent for general info
        const siteContent = getSiteContent();
        updateSiteContent({
          ...siteContent,
          navigation: {
            ...siteContent.navigation,
            brand: data.siteName
          },
          hero: {
            ...siteContent.hero,
            badge: data.tagline
          },
          seo: {
            ...siteContent.seo,
            title: data.siteName,
            description: data.description,
            keywords: data.keywords
          }
        });
      }

      if (section === 'social') {
        // Update siteContent for social media
        const siteContent = getSiteContent();
        const updatedSocials = siteContent.footer.socials.map(social => {
          if (social.type === 'x') return { ...social, href: data.twitter };
          if (social.type === 'youtube') return { ...social, href: data.youtube };
          if (social.type === 'telegram') return { ...social, href: data.telegram };
          return social;
        });

        updateSiteContent({
          ...siteContent,
          footer: {
            ...siteContent.footer,
            socials: updatedSocials
          }
        });
      }

      if (section === 'payments') {
        // Save mpesa credentials to site_settings
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            mpesa_consumer_key: data.mpesaConsumerKey,
            mpesa_consumer_secret: data.mpesaConsumerSecret,
            mpesa_short_code: data.mpesaShortCode,
            mpesa_passkey: data.mpesaPasskey,
            mpesa_callback_url: data.mpesaCallbackUrl,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Also save to localStorage as backup
      localStorage.setItem(`siteSettings_${section}`, JSON.stringify(data));
      
      toast({
        title: "Success",
        description: `${section} settings saved successfully`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Configure your website settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteInfo.siteName}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={siteInfo.tagline}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, tagline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={siteInfo.description}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={siteInfo.keywords}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="comma, separated, keywords"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ImageInput
                  label="Favicon"
                  value={siteInfo.favicon}
                  onChange={(value) => setSiteInfo(prev => ({ ...prev, favicon: value }))}
                  placeholder="Upload favicon or enter URL"
                  maxSizeText="Max 5MB, recommended: 32x32px or 16x16px PNG"
                  aspectRatio="aspect-square"
                  bucketName="blog-images"
                />
                
                <ImageInput
                  label="Logo"
                  value={siteInfo.logo}
                  onChange={(value) => setSiteInfo(prev => ({ ...prev, logo: value }))}
                  placeholder="Upload logo or enter URL"
                  maxSizeText="Max 5MB, recommended: 200x50px PNG with transparent background"
                  aspectRatio="aspect-[4/1]"
                  bucketName="blog-images"
                />
              </div>

              <Button onClick={() => handleSave('general', siteInfo)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Contact details displayed on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              </div>

              <Button onClick={() => handleSave('contact', contactInfo)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Contact Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <div className="space-y-6">
            {/* New Database-driven Social Links Manager */}
            <SocialLinksManager />
            
            {/* Legacy social media settings (kept for backward compatibility) */}
            <Card>
              <CardHeader>
                <CardTitle>Legacy Social Media Links</CardTitle>
                <CardDescription>
                  These are the old social media settings. Use the manager above for better control.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(socialMedia).map(([platform, url]) => (
                    <div key={platform}>
                      <Label htmlFor={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Label>
                      <Input
                        id={platform}
                        value={url}
                        onChange={(e) => setSocialMedia(prev => ({ ...prev, [platform]: e.target.value }))}
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={() => handleSave('social', socialMedia)} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Legacy Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultTitle">Default Page Title</Label>
                <Input
                  id="defaultTitle"
                  value={seoSettings.defaultTitle}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, defaultTitle: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="defaultDescription">Default Meta Description</Label>
                <Textarea
                  id="defaultDescription"
                  value={seoSettings.defaultDescription}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, defaultDescription: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={seoSettings.canonicalUrl}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                />
              </div>

              <ImageInput
                label="Default Open Graph Image"
                value={seoSettings.defaultOgImage || ''}
                onChange={(value) => setSeoSettings(prev => ({ ...prev, defaultOgImage: value }))}
                placeholder="Upload OG image or enter URL"
                maxSizeText="Max 5MB, recommended: 1200x630px"
                aspectRatio="aspect-[1200/630]"
                bucketName="blog-images"
              />

              <div>
                <Label htmlFor="robotsTxt">robots.txt Content</Label>
                <Textarea
                  id="robotsTxt"
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sitemap"
                  checked={seoSettings.sitemap}
                  onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, sitemap: checked }))}
                />
                <Label htmlFor="sitemap">Generate XML Sitemap</Label>
              </div>

              <Button onClick={() => handleSave('seo', seoSettings)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments (M-Pesa)</CardTitle>
              <CardDescription>
                Configure M-Pesa STK Push credentials (Business Short Code, Consumer Key/Secret, Passkey)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="mpesaConsumerKey">M-Pesa Consumer Key</Label>
                  <Input id="mpesaConsumerKey" value={payments.mpesaConsumerKey} onChange={(e) => setPayments(prev => ({ ...prev, mpesaConsumerKey: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="mpesaConsumerSecret">M-Pesa Consumer Secret</Label>
                  <Input id="mpesaConsumerSecret" value={payments.mpesaConsumerSecret} onChange={(e) => setPayments(prev => ({ ...prev, mpesaConsumerSecret: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="mpesaShortCode">Business Short Code</Label>
                  <Input id="mpesaShortCode" value={payments.mpesaShortCode} onChange={(e) => setPayments(prev => ({ ...prev, mpesaShortCode: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="mpesaPasskey">M-Pesa Passkey</Label>
                  <Input id="mpesaPasskey" value={payments.mpesaPasskey} onChange={(e) => setPayments(prev => ({ ...prev, mpesaPasskey: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="mpesaCallbackUrl">Callback URL</Label>
                  <Input id="mpesaCallbackUrl" value={payments.mpesaCallbackUrl} onChange={(e) => setPayments(prev => ({ ...prev, mpesaCallbackUrl: e.target.value }))} placeholder="https://your-domain.com/mpesa/callback" />
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Recommended (Supabase): https://[project-ref].functions.supabase.co/mpesa_callback
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        try {
                          const restUrl = (supabase as any)?.rest?.url as string | undefined;
                          if (!restUrl) return;
                          const host = new URL(restUrl).hostname; // e.g. dbtyzloscmhaskjlbyvl.supabase.co
                          const projectRef = host.split('.')[0];
                          const url = `https://${projectRef}.functions.supabase.co/mpesa_callback`;
                          setPayments(prev => ({ ...prev, mpesaCallbackUrl: url }));
                        } catch {}
                      }}
                    >
                      Use Supabase Callback URL
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('payments', payments)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Payments Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                Configure analytics and tracking codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Google Analytics Status</h3>
                <GAStatusCheck />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold mb-4">Tracking IDs</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={analytics.googleAnalyticsId}
                        onChange={(e) => setAnalytics(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                        placeholder="GA-XXXXXXXXX-X"
                      />
                    </div>
                    <div>
                      <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                      <Input
                        id="googleTagManagerId"
                        value={analytics.googleTagManagerId}
                        onChange={(e) => setAnalytics(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixelId"
                        value={analytics.facebookPixelId}
                        onChange={(e) => setAnalytics(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                        placeholder="123456789012345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hotjarId">Hotjar Site ID</Label>
                      <Input
                        id="hotjarId"
                        value={analytics.hotjarId}
                        onChange={(e) => setAnalytics(prev => ({ ...prev, hotjarId: e.target.value }))}
                        placeholder="1234567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('analytics', analytics)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Analytics Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable website features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={feature} className="font-medium">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {feature === 'maintenanceMode' && 'Put the site in maintenance mode'}
                      {feature === 'registrationEnabled' && 'Allow new user registrations'}
                      {feature === 'commentsEnabled' && 'Enable comments on blog posts'}
                      {feature === 'newsletterEnabled' && 'Show newsletter signup forms'}
                      {feature === 'cookieConsent' && 'Show cookie consent banner'}
                    </p>
                  </div>
                  <Switch
                    id={feature}
                    checked={enabled}
                    onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, [feature]: checked }))}
                  />
                </div>
              ))}

              <Button onClick={() => handleSave('features', features)} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Feature Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettings;
