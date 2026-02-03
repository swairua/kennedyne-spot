import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useChecklistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRequest = async (email: string, asset: string = 'drive_checklist') => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-checklist-request', {
        body: { 
          email,
          asset,
          source_url: window.location.href
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Download Link Sent!",
          description: "Check your email for the download link and instructions.",
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'Failed to send download link');
      }
    } catch (error: any) {
      console.error('Error requesting checklist:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRequest,
    isSubmitting
  };
}