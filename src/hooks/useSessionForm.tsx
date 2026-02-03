import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSessionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRegistration = async (email: string) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-session-registration', {
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
          title: "Registration Confirmed!",
          description: "You're registered for our trading sessions. Check your email for details.",
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'Failed to register');
      }
    } catch (error: any) {
      console.error('Error registering for session:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRegistration,
    isSubmitting
  };
}