import { useI18n } from '@/i18n';

export function SkipToContent() {
  const { t } = useI18n();
  const label = t('skip_to_main_content');
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:shadow-lg"
      aria-label={label}
    >
      {label}
    </a>
  );
}
