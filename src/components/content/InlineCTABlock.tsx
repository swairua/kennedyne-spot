import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink, Mail, Phone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createWhatsAppLink } from '@/utils/whatsapp';

interface InlineCTABlockProps {
  type: 'whatsapp' | 'link' | 'email' | 'phone';
  title: string;
  description?: string;
  buttonText: string;
  url: string;
  variant?: 'default' | 'subtle' | 'bold';
  className?: string;
}

export const InlineCTABlock: React.FC<InlineCTABlockProps> = ({
  type,
  title,
  description,
  buttonText,
  url,
  variant = 'default',
  className,
}) => {
  const handleClick = () => {
    let targetUrl = url;
    
    switch (type) {
      case 'whatsapp':
        targetUrl = createWhatsAppLink(url, `Hi, I'm interested in learning more!`);
        break;
      case 'email':
        targetUrl = `mailto:${url}`;
        break;
      case 'phone':
        targetUrl = `tel:${url}`;
        break;
      case 'link':
      default:
        // Check if external
        if (url.startsWith('http://') || url.startsWith('https://')) {
          window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }
        break;
    }
    
    if (type !== 'link') {
      window.open(targetUrl, '_blank');
    } else {
      window.location.href = targetUrl;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      case 'link':
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'email':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'phone':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'link':
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground';
    }
  };

  const variantStyles = {
    default: 'bg-muted/50 border border-border',
    subtle: 'bg-transparent',
    bold: 'bg-primary/10 border-2 border-primary',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 my-8 text-center',
        variantStyles[variant],
        className
      )}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      <Button
        onClick={handleClick}
        className={cn('gap-2', getButtonColor())}
        size="lg"
      >
        {getIcon()}
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Markdown-compatible CTA that can be embedded in content
export const renderCTAFromMarkdown = (ctaString: string): React.ReactNode => {
  // Parse CTA from markdown-like syntax: [CTA:type:title:buttonText:url]
  const match = ctaString.match(/\[CTA:(\w+):([^:]+):([^:]+):([^\]]+)\]/);
  if (!match) return null;

  const [, type, title, buttonText, url] = match;
  return (
    <InlineCTABlock
      type={type as 'whatsapp' | 'link' | 'email' | 'phone'}
      title={title}
      buttonText={buttonText}
      url={url}
    />
  );
};
