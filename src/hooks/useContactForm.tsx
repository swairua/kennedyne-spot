import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitContactForm = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-contact-form', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Message Sent!",
          description: "We'll get back to you within 24-48 hours during business days.",
        });
        return { success: true, showWhatsApp: true };
      } else {
        throw new Error(data?.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Send Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContactForm,
    isSubmitting
  };
}