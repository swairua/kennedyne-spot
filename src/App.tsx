import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipToContent } from "@/components/SkipToContent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PerformanceMonitor } from "@/components/dev/PerformanceMonitor";
import { useLongTaskObserver } from "@/hooks/useLongTaskObserver";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RequireRoles } from "@/components/RequireRoles";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { GTMProvider } from "@/components/GTMProvider";
import { useSiteSettingsFixed } from "@/hooks/useSiteSettingsFixed";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { CookieBanner } from "@/components/CookieBanner";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { StructuredData } from "@/components/StructuredData";
import { lazy, Suspense } from "react";

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-muted-foreground">Loading...</div>
  </div>
);

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/IndexWithSEO"));
const Strategy = lazy(() => import("./pages/StrategyWithSEO"));
const Services = lazy(() => import("./pages/ServicesWithSEO").then(m => ({ default: m.ServicesWithSEO })));
const FAQs = lazy(() => import("./pages/FAQPageWithSEO"));
const Contact = lazy(() => import("./pages/ContactWithSEO"));
const About = lazy(() => import("./pages/About"));
const LearnWithSEO = lazy(() => import("./pages/LearnWithSEO"));
const LP_MentorshipApply = lazy(() => import("./pages/LP_MentorshipApply"));
const SignalsTools = lazy(() => import("./pages/SignalsTools"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const RiskDisclaimer = lazy(() => import("./pages/RiskDisclaimer"));
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const AdminLeadsEnhanced = lazy(() => import("./pages/AdminLeadsEnhanced"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const Resources = lazy(() => import("./pages/ResourcesWithSEO"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LibraryAdminEnhanced = lazy(() => import("./pages/LibraryAdminEnhanced"));
const BlogManagerEnhanced = lazy(() => import("./pages/BlogManagerEnhanced"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const BlogPublic = lazy(() => import("./pages/BlogPublic"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQsManager = lazy(() => import("./pages/FAQsManager"));
const UsersRolesManager = lazy(() => import("./pages/UsersRolesManager"));
const SiteSettings = lazy(() => import("./pages/SiteSettings"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })));
const LP_DriveEducation = lazy(() => import("./pages/LP_DriveEducation"));
const PlacementQuiz = lazy(() => import("./pages/PlacementQuiz"));
const AdminTranslate = lazy(() => import("./pages/AdminTranslate"));
const AdminMigrations = lazy(() => import("./pages/AdminMigrations"));
const DebugGA = lazy(() => import("./pages/DebugGA"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Debug logging to see if App is rendering
console.log('App.tsx is loading and rendering');

// Health check component - simple endpoint, no SEO needed (blocked by robots.txt)
const HealthCheck = () => (
  <div>
    OK
  </div>
);

function App() {
  console.log('App component is rendering');
  const { settings } = useSiteSettingsFixed();

  // Monitor long tasks in production
  useLongTaskObserver({
    threshold: 50,
    onLongTask: (duration, taskType) => {
      // Log performance issues in production for monitoring
      if (process.env.NODE_ENV === 'production') {
        console.info(`Performance: ${Math.round(duration)}ms task (${taskType})`);
      }
    }
  });

  const Router = BrowserRouter;
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <GTMProvider gtmId={settings?.gtm_id || undefined}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="vite-ui-theme"
            themes={["dark", "light"]}
          >
            <TooltipProvider>
              <AuthProvider>
                <AppErrorBoundary>
                  <SkipToContent />
                  <PerformanceMonitor />
                  <CookieBanner />
                  <Toaster />
                  <Sonner />
                  <StructuredData />
                  <Router>
                    <ScrollToTop />
                    <AnalyticsProvider />
                    <BreadcrumbNavigation />
                    <Suspense fallback={<PageLoadingFallback />}>
                      <Routes>
                        <Route path="/_health" element={<HealthCheck />} />
                        <Route path="/debug/ga" element={<DebugGA />} />
                        <Route path="/" element={<Index />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/strategy" element={<Strategy />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/learn" element={<LearnWithSEO />} />
                        <Route path="/learn" element={<Navigate to="/services/learn" replace />} />
                        <Route path="/mentorship" element={<LP_MentorshipApply />} />
                        <Route path="/signals-tools" element={<SignalsTools />} />
                        <Route path="/blog" element={<BlogPublic />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/faqs" element={<FAQs />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/courses/:slug" element={<CourseDetail />} />
                        <Route path="/courses" element={<Navigate to="/resources#courses" replace />} />
                        <Route path="/lp/drive-education" element={<LP_DriveEducation />} />
                        <Route path="/lp/mentorship-apply" element={<Navigate to="/mentorship" replace />} />
                        <Route path="/placement-quiz" element={<PlacementQuiz />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-use" element={<TermsOfUse />} />
                        <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
                        <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />

                        <Route path="/admin" element={
                          <RequireRoles roles={['admin', 'super_admin']}>
                            <AdminLayout />
                          </RequireRoles>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="blog" element={<BlogManagerEnhanced />} />
                          <Route path="blog/:id" element={<BlogEditor />} />
                          <Route path="faqs" element={<FAQsManager />} />
                          <Route path="users-roles" element={
                            <RequireRoles roles={['super_admin']}>
                              <UsersRolesManager />
                            </RequireRoles>
                          } />
                          <Route path="settings" element={<SiteSettings />} />
                          <Route path="library" element={<LibraryAdminEnhanced />} />
                          <Route path="leads" element={<AdminLeadsEnhanced />} />
                          <Route path="import" element={
                            <RequireRoles roles={['super_admin']}>
                              <AdminImport />
                            </RequireRoles>
                          } />
                          <Route path="payments" element={<AdminPayments />} />
                          <Route path="translate" element={
                            <RequireRoles roles={['super_admin']}>
                              <AdminTranslate />
                            </RequireRoles>
                          } />
                          <Route path="migrations" element={
                            <RequireRoles roles={['super_admin']}>
                              <AdminMigrations />
                            </RequireRoles>
                          } />
                        </Route>

                        <Route path="/auth" element={<Auth />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Router>
                </AppErrorBoundary>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </GTMProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
