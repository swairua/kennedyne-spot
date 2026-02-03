import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  Search,
  Target,
  Shield,
  Play,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Users,
  Brain,
  BookOpen,
  BarChart3,
  MapPin,
  ChevronRight,
  Zap,
  LineChart,
  Clock
} from "lucide-react";
import traderWorkspaceHero from "@/assets/trader-workspace-hero.jpg";
import tradingProcessFlow from "@/assets/trading-process-flow.jpg";
import tradingWorkspace from "@/assets/trading-workspace.jpg";
import { driveSteps } from "@/content/drive";
import { useState } from "react";
import { useI18n } from '@/i18n';
import { useSiteContent } from '@/hooks/useSiteContent';
import { LINKS, getExternalLinkProps } from '@/constants/links';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScrollToHash } from '@/hooks/useScrollToHash';

const getComparisonData = (t: (k: string) => string) => ([
  {
    feature: t('comparison_focus'),
    drive: t('comparison_row_focus_drive'),
    indicators: t('comparison_row_focus_indicators'),
    priceAction: t('comparison_row_focus_price_action'),
    ict: t('comparison_row_focus_ict'),
    supplyDemand: t('comparison_row_focus_supply_action')
  },
  {
    feature: t('comparison_direction'),
    drive: t('comparison_row_direction_drive'),
    indicators: t('comparison_row_direction_indicators'),
    priceAction: t('comparison_row_direction_price_action'),
    ict: t('comparison_row_direction_ict'),
    supplyDemand: t('comparison_row_direction_supply_action')
  },
  {
    feature: t('comparison_consistency'),
    drive: t('comparison_row_consistency_drive'),
    indicators: t('comparison_row_consistency_indicators'),
    priceAction: t('comparison_row_consistency_price_action'),
    ict: t('comparison_row_consistency_ict'),
    supplyDemand: t('comparison_row_consistency_supply_action')
  },
  {
    feature: t('comparison_risk_management'),
    drive: t('comparison_row_risk_management_drive'),
    indicators: t('comparison_row_risk_management_indicators'),
    priceAction: t('comparison_row_risk_management_price_action'),
    ict: t('comparison_row_risk_management_ict'),
    supplyDemand: t('comparison_row_risk_management_supply_action')
  },
  {
    feature: t('comparison_learning_curve'),
    drive: t('comparison_row_learning_curve_drive'),
    indicators: t('comparison_row_learning_curve_indicators'),
    priceAction: t('comparison_row_learning_curve_price_action'),
    ict: t('comparison_row_learning_curve_ict'),
    supplyDemand: t('comparison_row_learning_curve_supply_action')
  },
  {
    feature: t('comparison_best_for'),
    drive: t('comparison_row_best_for_drive'),
    indicators: t('comparison_row_best_for_indicators'),
    priceAction: t('comparison_row_best_for_price_action'),
    ict: t('comparison_row_best_for_ict'),
    supplyDemand: t('comparison_row_best_for_supply_action')
  }
]);

// Localized at render time
const whyChooseData = (t: (k: string) => string) => ([
  {
    icon: Target,
    title: t('strategy_why_item1_title'),
    description: t('strategy_why_item1_desc')
  },
  {
    icon: Shield,
    title: t('strategy_why_item2_title'),
    description: t('strategy_why_item2_desc')
  },
  {
    icon: Brain,
    title: t('strategy_why_item3_title'),
    description: t('strategy_why_item3_desc')
  },
  {
    icon: Users,
    title: t('strategy_why_item4_title'),
    description: t('strategy_why_item4_desc')
  }
]);

const Strategy = () => {
  const { t } = useI18n();
  const { content } = useSiteContent();
  const page = content.pages.driveStrategy;
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: "" });

  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [videoEmail, setVideoEmail] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [resultVideo, setResultVideo] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: "" });

  // Handle smooth scrolling to hash anchors
  useScrollToHash();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hashId: string) => {
    e.preventDefault();
    const element = document.getElementById(hashId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `${window.location.pathname}#${hashId}`);
    }
  };
  const handleDownload = () => {
    setResult({ type: null, message: "" });
    setEmail("");
    setOpenEmailDialog(true);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setResult({ type: 'error', message: t('strategy_error_invalid_email') });
      return;
    }
    setIsSubmitting(true);
    setResult({ type: null, message: "" });
    try {
      const { data, error } = await supabase.functions.invoke('submit-checklist-request', {
        body: {
          email,
          asset: 'drive_checklist',
          source_url: window.location.href,
        },
      });
      if (error) throw error;
      if (data?.success) {
        setResult({ type: 'success', message: t('strategy_success_download_sent') });
      } else {
        setResult({ type: 'error', message: t('strategy_error_unexpected_response') });
      }
    } catch (err) {
      console.error('Error requesting checklist:', err);
      setResult({ type: 'error', message: t('strategy_error_failed_send') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoEmail || !videoEmail.includes("@")) {
      setResultVideo({ type: 'error', message: t('strategy_error_invalid_email') });
      return;
    }
    setIsSubmittingVideo(true);
    setResultVideo({ type: null, message: "" });
    try {
      const { data, error } = await supabase.functions.invoke('submit-checklist-request', {
        body: {
          email: videoEmail,
          asset: 'drive_video',
          source_url: window.location.href,
        },
      });
      if (error) throw error;
      if (data?.success) {
        setResultVideo({ type: 'success', message: t('strategy_success_video_sent') });
      } else {
        setResultVideo({ type: 'error', message: t('strategy_error_unexpected_response') });
      }
    } catch (err) {
      console.error('Error requesting video:', err);
      setResultVideo({ type: 'error', message: t('strategy_error_failed_send') });
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const detailKeys: string[][] = [
    ['drive_direction_detail1','drive_direction_detail2','drive_direction_detail3'],
    ['drive_range_detail1','drive_range_detail2','drive_range_detail3'],
    ['drive_poi_detail1','drive_poi_detail2','drive_poi_detail3'],
    ['drive_value_of_risk_detail1','drive_value_of_risk_detail2','drive_value_of_risk_detail3'],
    ['drive_entry_detail1','drive_entry_detail2','drive_entry_detail3'],
  ];

  const comparisonData = getComparisonData(t);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img 
              src={traderWorkspaceHero}
              alt={t('strategy_hero_alt')}
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
              onError={(e) => {
                console.warn('Hero image failed to load');
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-hero-premium grain-texture"></div>
          <div className="container px-4 relative z-20 on-hero">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-white/10 border border-white/20 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('strategy_badge')}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tighter text-white mb-6 leading-tight">
                {page.title}
              </h1>
              <p className="text-hero-body text-white/90 mb-4 leading-relaxed max-w-3xl mx-auto">
                {page.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button variant="hero" size="lg" onClick={(e) => handleAnchorClick(e as any, 'drive-steps')}>
                  Start Trading DRIVE
                </Button>
                <Button
                  variant="glass"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={(e) => handleAnchorClick(e as any, 'why-choose')}
                >
                  Start Learning DRIVE
                </Button>
              </div>
              
              {/* Video Section */}
              <div className="mb-8 max-w-3xl mx-auto">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full rounded-lg shadow-lg"
                  src="https://cdn.builder.io/o/assets%2Fa0a8da52b13a46b692f489902ea746ed%2Fec3d5fddc4794034b8378f4ee3b85840?alt=media&token=2bcbb705-9fa8-4ee5-9ed2-7e1b4357c026&apiKey=a0a8da52b13a46b692f489902ea746ed"
                  aria-label="DRIVE strategy overview video"
                />
              </div>
              
              {/* Quick Navigation */}
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <button onClick={(e) => handleAnchorClick(e as any, 'drive-steps')} className="text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white pb-1 cursor-pointer bg-transparent border-0 p-0">
                  {t('strategy_nav_steps')}
                </button>
                <span className="text-white/40">|</span>
                <button onClick={(e) => handleAnchorClick(e as any, 'comparison')} className="text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white pb-1 cursor-pointer bg-transparent border-0 p-0">
                  {t('strategy_nav_comparison')}
                </button>
                <span className="text-white/40">|</span>
                <button onClick={(e) => handleAnchorClick(e as any, 'why-choose')} className="text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white pb-1 cursor-pointer bg-transparent border-0 p-0">
                  {t('strategy_nav_why_choose')}
                </button>
              </div>


            </div>
          </div>
        </section>

        {/* DRIVE Steps */}
        <section id="drive-steps" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
          <div className="container px-4 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="fluid-h2 text-foreground mb-6">
                  {t('drive_framework_title')}
                </h2>
                <p className="fluid-body text-muted-foreground max-w-3xl mx-auto">
                  {t('drive_framework_description')}
                </p>
              </div>

              {/* Desktop Timeline */}
              <div className="hidden lg:block relative mb-20">
                <div className="flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-primary to-primary/30 transform -translate-y-1/2"></div>
                  {driveSteps.map((step, index) => (
                    <div key={index} className="relative flex flex-col items-center group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg ring-4 ring-primary/20 ring-offset-4 ring-offset-background group-hover:ring-primary/40 transition-all duration-300 mb-6 relative z-10">
                        {step.letter}
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-colors duration-300"></div>
                      </div>
                      <Card className="p-6 max-w-xs glass-card group-hover:shadow-card transition-all duration-300">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors duration-300">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2 text-center group-hover:text-primary transition-colors duration-300">
                          {t(['drive_direction_title','drive_range_title','drive_poi_title','drive_value_of_risk_title','drive_entry_title'][index] || 'drive_direction_title')}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          {t(['drive_direction_desc','drive_range_desc','drive_poi_desc','drive_value_of_risk_desc','drive_entry_desc'][index] || 'drive_direction_desc')}
                        </p>
                        <ul className="space-y-2 list-none pl-0">
                          {detailKeys[index].map((k, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-primary mr-2 mt-0.5 flex-shrink-0" />
                              {t(k)}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-6">
                {driveSteps.map((step, index) => (
                  <Card key={index} className="p-6 glass-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4">
                        {step.letter}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                          {t(['drive_direction_title','drive_range_title','drive_poi_title','drive_value_of_risk_title','drive_entry_title'][index] || 'drive_direction_title')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('step')} {index + 1} {t('of')} 5
                        </p>
                      </div>
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t(['drive_direction_desc','drive_range_desc','drive_poi_desc','drive_value_of_risk_desc','drive_entry_desc'][index] || 'drive_direction_desc')}
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                      {detailKeys[index].map((k, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          {t(k)}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className="py-20 bg-muted/50">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="fluid-h2 text-foreground mb-6">
                  {t('strategy_vs_title')}
                </h2>
                <p className="fluid-body text-muted-foreground max-w-3xl mx-auto">
                  {t('strategy_vs_subtitle')}
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">{t('comparison_feature')}</TableHead>
                        <TableHead className="font-semibold text-primary">{t('comparison_drive')}</TableHead>
                        <TableHead className="font-semibold">{t('comparison_indicators')}</TableHead>
                        <TableHead className="font-semibold">{t('comparison_price_action')}</TableHead>
                        <TableHead className="font-semibold">{t('comparison_ict')}</TableHead>
                        <TableHead className="font-semibold">{t('comparison_supply_demand')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.feature}</TableCell>
                          <TableCell className="bg-primary/5 font-medium text-primary">{row.drive}</TableCell>
                          <TableCell>{row.indicators}</TableCell>
                          <TableCell>{row.priceAction}</TableCell>
                          <TableCell>{row.ict}</TableCell>
                          <TableCell>{row.supplyDemand}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-6">
                {comparisonData.map((row, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 text-primary mr-2" />
                      {row.feature}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="font-medium text-primary text-sm mb-1">{t('comparison_drive')}</div>
                        <div className="text-sm text-foreground">{row.drive}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">{t('comparison_indicators')}</div>
                          <div className="text-foreground">{row.indicators}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">{t('comparison_price_action')}</div>
                          <div className="text-foreground">{row.priceAction}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">{t('comparison_ict')}</div>
                          <div className="text-foreground">{row.ict}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">{t('comparison_supply_demand')}</div>
                          <div className="text-foreground">{row.supplyDemand}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose DRIVE */}
        <section id="why-choose" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
          <div className="container px-4 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="fluid-h2 text-foreground mb-6">
                  {t('strategy_why_title')}
                </h2>
                <p className="fluid-body text-muted-foreground max-w-3xl mx-auto">
                  {t('strategy_why_subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {whyChooseData(t).map((item, index) => (
                  <Card key={index} className="p-6 glass-card hover:shadow-card transition-all duration-300 hover:scale-[1.02] group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="default" size="lg" className="hover:scale-105 transition-transform duration-300" asChild>
                  <a {...getExternalLinkProps(LINKS.exness.signup)} aria-label="Get started with DRIVE trading strategy">
                    Get Started with DRIVE
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Education Disclaimer */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 border border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('strategy_disclaimer_title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('strategy_disclaimer_text')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton />

      <Dialog open={openVideoDialog} onOpenChange={setOpenVideoDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('strategy_watch_video_btn')}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video">
            <video
              autoPlay
              muted
              playsInline
              controls
              preload="metadata"
              className="w-full h-full rounded-lg"
              src="https://cdn.builder.io/o/assets%2Ff677abe3095d4432a56cc618b51eadf0%2Feb78258f0c05499db2e428b277404842?alt=media&token=28d911b4-3bf9-4435-9a57-b9f0b7c5abb4&apiKey=f677abe3095d4432a56cc618b51eadf0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenVideoDialog(false)}>
              {t('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEmailDialog} onOpenChange={(open) => { setOpenEmailDialog(open); if (!open) { setResult({ type: null, message: "" }); setEmail(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('strategy_dialog_checklist_title')}</DialogTitle>
            <DialogDescription>
              {t('strategy_dialog_checklist_desc')}
            </DialogDescription>
          </DialogHeader>

          {result.type === 'success' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span>{t('strategy_success_download_sent')}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              {result.type === 'error' && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">{result.message}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email_address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('strategy_email_placeholder')}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEmailDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('sending') : t('strategy_send_download')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Strategy;
