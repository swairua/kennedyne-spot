import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitSubscription = async (email: string) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-newsletter-subscription', {
        body: { 
          email,
          source_url: window.location.href
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Subscribed Successfully!",
          description: "Welcome to Weekly Market Notes. Check your email for confirmation.",
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'Failed to subscribe');
      }
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSubscription,
    isSubmitting
  };
}