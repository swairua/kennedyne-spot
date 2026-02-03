import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { AlertTriangle, MessageCircle, Send, Youtube, Twitter, Phone, Mail, Shield, Instagram } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { useUserRoles } from "@/hooks/useUserRoles";
import { LINKS, getExternalLinkProps } from "@/constants/links";
import { createWhatsAppLink, WHATSAPP_MESSAGES, DEFAULT_WHATSAPP_PHONE } from "@/utils/whatsapp";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  telegram: Send,
  youtube: Youtube,
  x: Twitter,
  instagram: Instagram,
};

const getSocialIcon = (type?: string): LucideIcon => {
  if (!type) return MessageCircle;
  const key = type.toLowerCase();
  return SOCIAL_ICON_MAP[key] ?? MessageCircle;
};

export function Footer() {
  const { content } = useSiteContent();
  const { isAdmin } = useUserRoles();
  const { socialLinks } = useSocialLinks();
  const { footer } = content;
  // Use database social links if available, otherwise fall back to siteContent
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : (footer.socials ?? []);
  const serviceItems = footer.services?.items ?? [];
  const sectionGroups = footer.sections ?? [];
  const legalLinks = footer.legalLinks ?? [];

  return (
    <footer role="contentinfo" aria-labelledby="footer-heading" className="relative bg-background/80 dark:bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:dark:bg-background/60 border-t border-border/30 before:absolute before:inset-0 before:bg-gray-700/60 before:dark:bg-transparent before:-z-10">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="relative bg-gradient-to-b from-transparent to-transparent dark:from-background dark:to-muted/30">
        <div className="absolute inset-0 bg-gradient-hero-premium grain-texture pointer-events-none" />
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 relative z-10">
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand + Socials */}
            <div className="space-y-3 sm:space-y-4 sm:col-span-1 lg:col-span-1">
              <div className="block">
                <Link to="/" aria-label="Home" className="block w-fit">
                  <BrandLogo className="w-32 sm:w-40 h-auto max-h-16 sm:max-h-20 md:max-h-24" />
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {footer.description}
              </p>

              {/* Social Links */}
              {displaySocialLinks.length > 0 && (
                <div className="flex items-center gap-3 sm:gap-4 pt-2">
                  {displaySocialLinks.map((social, index) => {
                    const Icon = getSocialIcon(social.type);
                    const label = social.name || "Social link";
                    return (
                      <a
                        key={`${social.href}-${index}`}
                        {...getExternalLinkProps(social.href)}
                        aria-label={label}
                        title={label}
                        className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full p-1.5 sm:p-2 min-h-10 min-w-10 flex items-center justify-center"
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                        <span className="sr-only">{label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact */}
            <address className="not-italic space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground dark:text-white">
                Contact
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {footer.email && (
                  <a
                    href={`mailto:${footer.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover:translate-x-px transform duration-200 break-all min-h-9 sm:min-h-10"
                  >
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="break-all">{footer.email}</span>
                  </a>
                )}
                {footer.phone && (
                  <a
                    href={`tel:${footer.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover:translate-x-px transform duration-200 min-h-9 sm:min-h-10"
                  >
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{footer.phone}</span>
                  </a>
                )}
              </div>
            </address>

            {/* Services */}
            {serviceItems.length > 0 && (
              <nav aria-label={footer.services?.title || "Services"} className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-foreground dark:text-white">
                  {footer.services?.title || "Services"}
                </h3>
                <ul className="space-y-2 sm:space-y-3 list-none pl-0">
                  {serviceItems.map((service, index) => {
                    if (typeof service === 'string') {
                      return (
                        <li key={`${service}-${index}`}>
                          <span className="text-xs sm:text-sm text-muted-foreground cursor-default block min-h-8 sm:min-h-9 flex items-center">
                            {service}
                          </span>
                        </li>
                      );
                    }
                    const href = service.href || "#";
                    const linkClasses = "text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-px transform duration-200 block min-h-8 sm:min-h-9 flex items-center";
                    if (href.startsWith("http")) {
                      return (
                        <li key={`${href}-${index}`}>
                          <a {...getExternalLinkProps(href)} className={linkClasses}>
                            {service.name}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={`${href}-${index}`}>
                        <Link to={href} className={linkClasses}>
                          {service.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            {/* Section Groups (Education, Support) */}
            {sectionGroups.map((section, index) => (
              <nav
                key={`${section?.title ?? "section"}-${index}`}
                aria-label={section?.title || `section-${index}`}
                className={`space-y-3 sm:space-y-4 ${index > 0 ? "hidden md:block" : ""}`}
              >
                {section?.title && (
                  <h3 className="text-sm sm:text-base font-semibold text-foreground dark:text-white">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-2 sm:space-y-3 list-none pl-0">
                  {(section?.links || []).map((link, linkIndex) => {
                    if (!link?.name) return null;
                    const href = link.href || "#";
                    const linkClasses = "text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-px transform duration-200 block min-h-8 sm:min-h-9 flex items-center";
                    if (href.startsWith("http")) {
                      return (
                        <li key={`${href}-${linkIndex}`}>
                          <a {...getExternalLinkProps(href)} className={linkClasses}>
                            {link.name}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={`${href}-${linkIndex}`}>
                        <Link to={href} className={linkClasses}>
                          {link.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 my-8 sm:my-10 md:my-12" />

          {/* Bottom Bar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Copyright and Legal Links */}
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {footer.copyright}
              </p>

              {/* Legal Links - Responsive Wrap */}
              <nav aria-label="Legal" className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
                {legalLinks.map((link, index) => {
                  if (!link?.name) return null;
                  const href = link.href || "#";
                  const classes = "text-xs sm:text-sm text-muted-foreground dark:text-white hover:text-primary transition-colors min-h-8 sm:min-h-9 flex items-center";
                  if (href.startsWith("http")) {
                    return (
                      <a key={`${href}-${index}`} {...getExternalLinkProps(href)} className={classes}>
                        {link.name}
                      </a>
                    );
                  }
                  return (
                    <Link key={`${href}-${index}`} to={href} className={classes}>
                      {link.name}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium min-h-8 sm:min-h-9 flex items-center"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* Admin Controls - Responsive Layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div className="opacity-60 hover:opacity-100 transition-opacity">
                <AuthButton />
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100 min-h-9 sm:min-h-10"
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Trading Disclaimer - Responsive */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed flex items-center justify-center gap-2 flex-wrap">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning flex-shrink-0" aria-hidden="true" />
                <span>{footer.riskDisclaimer}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
