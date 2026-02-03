import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, ExternalLink, Mail, Phone, Megaphone } from 'lucide-react';
import { InlineCTABlock } from '@/components/content/InlineCTABlock';

interface InsertCTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (ctaSyntax: string) => void;
}

type CTAType = 'whatsapp' | 'link' | 'email' | 'phone';

const ctaTypes: { value: CTAType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: <MessageCircle className="h-4 w-4" />,
    placeholder: '+254700000000',
  },
  {
    value: 'link',
    label: 'External Link',
    icon: <ExternalLink className="h-4 w-4" />,
    placeholder: 'https://example.com',
  },
  {
    value: 'email',
    label: 'Email',
    icon: <Mail className="h-4 w-4" />,
    placeholder: 'contact@example.com',
  },
  {
    value: 'phone',
    label: 'Phone Call',
    icon: <Phone className="h-4 w-4" />,
    placeholder: '+254700000000',
  },
];

export const InsertCTAModal: React.FC<InsertCTAModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [type, setType] = useState<CTAType>('whatsapp');
  const [title, setTitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [url, setUrl] = useState('');

  const selectedTypeInfo = ctaTypes.find((t) => t.value === type);

  const handleInsert = () => {
    if (!title.trim() || !buttonText.trim() || !url.trim()) return;
    
    // Generate the CTA syntax: [CTA:type:title:buttonText:url]
    const ctaSyntax = `[CTA:${type}:${title}:${buttonText}:${url}]`;
    onInsert(ctaSyntax);
    
    // Reset form
    setType('whatsapp');
    setTitle('');
    setButtonText('');
    setUrl('');
    onClose();
  };

  const handleClose = () => {
    setType('whatsapp');
    setTitle('');
    setButtonText('');
    setUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Insert Call-to-Action
          </DialogTitle>
          <DialogDescription>
            Add an inline CTA block to encourage reader engagement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cta-type">CTA Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CTAType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ctaTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      {t.icon}
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-title">Title</Label>
            <Input
              id="cta-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ready to Start Trading?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-button">Button Text</Label>
            <Input
              id="cta-button"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="e.g., Get Started Now"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-url">
              {type === 'whatsapp' && 'WhatsApp Number'}
              {type === 'email' && 'Email Address'}
              {type === 'phone' && 'Phone Number'}
              {type === 'link' && 'URL'}
            </Label>
            <Input
              id="cta-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={selectedTypeInfo?.placeholder}
            />
          </div>

          {/* Live Preview */}
          {title && buttonText && url && (
            <div className="pt-4 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
              <div className="scale-90 origin-top-left">
                <InlineCTABlock
                  type={type}
                  title={title}
                  buttonText={buttonText}
                  url={url}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={!title.trim() || !buttonText.trim() || !url.trim()}
          >
            Insert CTA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
