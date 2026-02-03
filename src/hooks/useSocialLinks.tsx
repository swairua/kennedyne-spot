import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { defaultContent } from '@/content/siteContent';

export interface SocialLink {
  name: string;
  href: string;
  type: string;
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = defaultContent.footer.socials;

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('social_links')
          .maybeSingle();

        if (error) {
          console.error('Error fetching social links:', error);
          // Fall back to defaults
          return;
        }

        if (data?.social_links && Array.isArray(data.social_links) && data.social_links.length > 0) {
          // Validate and cast the data
          const links = (data.social_links as unknown as SocialLink[]).filter(
            (link): link is SocialLink => 
              typeof link === 'object' && 
              link !== null &&
              typeof link.name === 'string' && 
              typeof link.href === 'string' && 
              typeof link.type === 'string'
          );
          if (links.length > 0) {
            setSocialLinks(links);
          }
        }
      } catch (err) {
        console.error('Error in useSocialLinks:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  return { socialLinks, loading, error };
}

export async function updateSocialLinks(links: SocialLink[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert to JSON-compatible format
    const jsonLinks = JSON.parse(JSON.stringify(links));
    
    const { error } = await supabase
      .from('site_settings')
      .update({
        social_links: jsonLinks,
        updated_at: new Date().toISOString()
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
