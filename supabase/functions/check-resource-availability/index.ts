import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ available: false, error: 'No URL provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let available = false;

    // Check if it's a Supabase storage URL
    if (url.includes('/storage/v1/object/')) {
      try {
        // Initialize Supabase client
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Extract the resource path from the URL
        const urlParts = url.split('/storage/v1/object/');
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const resourcePath = pathParts.join('/');
          
          console.log(`Checking Supabase storage: bucket=${bucket}, path=${resourcePath}`);
          
          // Try to create a signed URL - this will fail if file doesn't exist
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(resourcePath, 60); // 1 minute expiry for check
          
          available = !error && !!data?.signedUrl;
          
          if (error) {
            console.log(`Storage check failed: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('Error checking Supabase storage:', error);
        available = false;
      }
    } else {
      // For external URLs, use HEAD request
      try {
        console.log(`Checking external URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Resource-Checker/1.0'
          }
        });
        
        available = response.ok;
        console.log(`External URL check result: ${response.status}`);
      } catch (error) {
        console.error('Error checking external URL:', error);
        available = false;
      }
    }

    return new Response(
      JSON.stringify({ available }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in check-resource-availability function:', error);
    return new Response(
      JSON.stringify({ 
        available: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});