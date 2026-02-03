import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/GTMProvider";
import { createWhatsAppLink, WHATSAPP_MESSAGES, DEFAULT_WHATSAPP_PHONE } from "@/utils/whatsapp";

export function WhatsAppButton() {
  const handleClick = () => {
    const whatsappUrl = createWhatsAppLink(DEFAULT_WHATSAPP_PHONE, WHATSAPP_MESSAGES.support);
    
    trackEvent('whatsapp_contact_click', { 
      source: 'floating_button',
      message_preview: WHATSAPP_MESSAGES.support
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative">
        {/* Chat bubble indicator */}
        <div className="absolute -top-2 -left-2 w-3 h-3 bg-secondary rounded-full animate-pulse opacity-75"></div>
        
        <Button
          onClick={handleClick}
          variant="secondary"
          size="lg"
          className="rounded-full shadow-elevation hover:shadow-lg transition-all duration-300 sm:text-sm text-xs sm:px-6 px-4 will-change-transform hover:scale-105"
          aria-label="Contact us via WhatsApp"
        >
          <MessageCircle className="h-5 w-5 sm:mr-2 mr-1" />
          <span className="hidden sm:inline">Get Support</span>
          <span className="sm:hidden">Support</span>
        </Button>
      </div>
    </div>
  );
}