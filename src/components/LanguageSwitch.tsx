import React from 'react';
import { useI18n, switchLanguage } from '@/i18n';
import type { Locale } from '@/i18n';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  size?: 'sm' | 'md';
};

export const LanguageSwitch: React.FC<Props> = ({ className, size = 'md' }) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const setLang = (lang: Locale) => {
    try {
      switchLanguage(lang);
    } catch {
      setLanguage(lang);
    }
    setIsOpen(false);
  };

  const languages = [
    { code: 'en' as const, label: 'EN', fullName: 'English' },
    { code: 'fr' as const, label: 'FR', fullName: 'Français' },
    { code: 'es' as const, label: 'ES', fullName: 'Español' },
    { code: 'de' as const, label: 'DE', fullName: 'Deutsch' },
    { code: 'ru' as const, label: 'RU', fullName: 'Русский' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-primary/10 hover:text-primary',
          size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
          className
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="font-medium">{currentLang.label}</span>
        <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-md border border-border bg-popover shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLang(lang.code)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                  'first:rounded-t-md last:rounded-b-md',
                  language === lang.code && 'bg-primary/10 text-primary font-medium'
                )}
              >
                <span className="font-medium">{lang.label}</span>
                <span className="ml-2 text-muted-foreground">{lang.fullName}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitch;
