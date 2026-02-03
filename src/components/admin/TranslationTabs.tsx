import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Bot, AlertCircle, Circle } from 'lucide-react';

type TranslationStatus = 'complete' | 'auto' | 'pending' | 'missing';

interface TranslationTabsProps {
  translationStatus?: Record<string, TranslationStatus>;
  children: (lang: string) => React.ReactNode;
}

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const StatusIcon: React.FC<{ status: TranslationStatus }> = ({ status }) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case 'auto':
      return <Bot className="h-3 w-3 text-blue-500" />;
    case 'pending':
      return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    default:
      return <Circle className="h-3 w-3 text-muted-foreground" />;
  }
};

export const TranslationTabs: React.FC<TranslationTabsProps> = ({ translationStatus = {}, children }) => {
  return (
    <Tabs defaultValue="en" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {languages.map((lang) => {
          const status = lang.code === 'en' ? 'complete' : (translationStatus[lang.code] as TranslationStatus || 'missing');
          
          return (
            <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-1">
              <span>{lang.flag}</span>
              <span className="hidden sm:inline">{lang.label}</span>
              <span className="sm:hidden">{lang.code.toUpperCase()}</span>
              <StatusIcon status={status} />
            </TabsTrigger>
          );
        })}
      </TabsList>

      {languages.map((lang) => (
        <TabsContent key={lang.code} value={lang.code} className="mt-4">
          {lang.code !== 'en' && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant={translationStatus[lang.code] === 'complete' ? 'default' : 'secondary'}>
                {translationStatus[lang.code] === 'complete' && '✓ Manual Translation'}
                {translationStatus[lang.code] === 'auto' && '🤖 Auto-Translated'}
                {translationStatus[lang.code] === 'pending' && '⏳ Pending Review'}
                {translationStatus[lang.code] === 'missing' && '⚠️ Not Translated'}
              </Badge>
            </div>
          )}
          {children(lang.code)}
        </TabsContent>
      ))}
    </Tabs>
  );
};
