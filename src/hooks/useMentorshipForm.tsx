import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MentorshipFormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  goals: string;
  availability: string;
}

export function useMentorshipForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitApplication = async (formData: MentorshipFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-mentorship-application', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Application Submitted!",
          description: "We'll review your application and get back to you within 48 hours.",
        });
        return { success: true, showWhatsApp: true };
      } else {
        throw new Error(data?.error || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error submitting mentorship application:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting
  };
}