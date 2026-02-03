import React, { useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Send, Star, BookOpen, Briefcase, BarChart2, Sparkles, MapPin, Calendar, FileText } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LINKS, getExternalLinkProps, getInternalLinkProps } from "@/constants/links";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useI18n, switchLanguage } from '@/i18n';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";


export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { content } = useSiteContent();
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();
  const toggleLanguage = () => {
    const next = language === 'en' ? 'fr' : 'en';
    try {
      switchLanguage(next);
    } catch (e) {
      // fallback to context setLanguage
      setLanguage(next);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const links = content.navigation.links || [];
  const primaryLinks = links.slice(0, 3);
  const overflowLinks = links.slice(3);

  // Icons for nested items
  const nestedIcons = [Star, BookOpen, Briefcase, BarChart2, Sparkles, MapPin, Calendar, FileText];

  return (
    <nav aria-label="Main" className="sticky top-0 z-50 w-full bg-gradient-glass/50 dark:bg-gradient-glass/50 backdrop-blur-glass border-b border-border/20 shadow-glass relative before:absolute before:inset-0 before:bg-gray-700/60 before:dark:bg-transparent before:-z-10">
      <div className="container flex min-h-16 md:min-h-20 xl:min-h-28 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3" aria-label="Home">
          <BrandLogo
            size="md"
            className="h-8 md:h-10 lg:h-20 xl:h-28"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <NavigationMenu className="mx-0">
            <NavigationMenuList className="space-x-2">
              {primaryLinks.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link
                      to={item.href}
                      className={`bg-transparent px-3 py-2 ${isActive(item.href) ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {overflowLinks.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent px-3 py-2 text-foreground hover:text-primary">
                    {t('nav_more')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 min-w-[22rem]">
                      {overflowLinks.map((item, idx) => {
                        const Icon = nestedIcons[idx % nestedIcons.length];
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary text-sm transition-colors"
                          >
                            <Icon className="mr-2 h-4 w-4 opacity-80" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <LanguageSwitch size="sm" />
            <ThemeToggle />
          </div>
          <a
            {...getExternalLinkProps(LINKS.telegram.kenneDynespot)}
            aria-label={t('nav_open_telegram')}
            className="text-foreground hover:text-primary transition-colors p-2 rounded-md"
          >
            <Send className="h-5 w-5" />
          </a>
          <Button variant="outline" size="sm" className="font-semibold" asChild>
            <Link to={LINKS.internal.strategy}>
              {t('nav_learn_drive')}
            </Link>
          </Button>
          <Button variant="hero" size="sm" className="font-semibold" asChild>
            <a {...getExternalLinkProps(LINKS.exness.signup)}>
              {t('nav_start_trading')}
            </a>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 lg:hidden">
          <LanguageSwitch size="sm" />
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50" aria-expanded={isOpen} aria-controls="mobile-menu">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
          <SheetContent side="right" id="mobile-menu" className="w-80 glass-card border-l border-border/50">
            <div className="flex flex-col space-y-6 mt-6 px-4">
              <div className="flex items-center justify-between">
                <BrandLogo
                  size="md"
                  className="h-12 md:h-16"
                />
                <div className="flex items-center space-x-2">
                  <LanguageSwitch size="sm" />
                  <ThemeToggle />
                </div>
              </div>

              <div className="space-y-4 mt-2">
                {content.navigation.links.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-medium py-2 transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-foreground"
              }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="pt-4 space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setIsOpen(false); }}
                  asChild
                >
                  <Link to={LINKS.internal.strategy}>
                    {t('nav_learn_drive')}
                  </Link>
                </Button>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => { setIsOpen(false); }}
                  asChild
                >
                   <a {...getExternalLinkProps(LINKS.exness.signup)}>
                     {t('nav_start_trading')}
                   </a>
                </Button>
                <div className="pt-4 border-t border-border/40" />
                <div className="flex items-center justify-between">
                  <a {...getExternalLinkProps(LINKS.telegram.kenneDynespot)} className="text-foreground hover:text-primary">
                    <Send className="h-5 w-5 inline-block mr-2" /> {t('nav_telegram')}
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>{t('nav_close')}</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </nav>
  );
}
