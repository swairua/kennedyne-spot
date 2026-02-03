import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { url, filename } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract resource path from various Supabase storage URL formats
    let resourcePath = '';
    
    if (url.includes('/storage/v1/object/public/resources/')) {
      resourcePath = url.split('/storage/v1/object/public/resources/')[1];
    } else if (url.includes('/storage/v1/object/sign/resources/')) {
      resourcePath = url.split('/storage/v1/object/sign/resources/')[1];
    } else if (url.includes('/storage/v1/object/') && url.includes('/resources/')) {
      // Handle other storage URL patterns
      const match = url.match(/\/resources\/(.+)/);
      resourcePath = match ? match[1] : '';
    } else if (url.startsWith('/downloads/')) {
      // Handle relative paths like /downloads/file.pdf
      resourcePath = url.substring(1);
    } else if (url.startsWith('/')) {
      // Handle other relative paths
      resourcePath = url.substring(1);
    } else {
      // If it's not a storage URL, return the original URL
      return new Response(
        JSON.stringify({ url, filename }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating signed URL for resource path:', resourcePath);

    // Create signed URL with 5 minute expiry
    const { data: signedUrl, error } = await supabase.storage
      .from('resources')
      .createSignedUrl(resourcePath, 300); // 5 minutes

    if (error) {
      console.error('Error creating signed URL:', error);
      
      // If the file is not found, provide a more specific error message
      if (error.message?.includes('Object not found') || error.statusCode === '404') {
        return new Response(
          JSON.stringify({ 
            error: 'File not found', 
            message: `The file "${resourcePath}" was not found in storage. Please check if the file exists or contact support.` 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create download link',
          message: 'There was an issue generating the download link. Please try again or contact support.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!signedUrl?.signedUrl) {
      return new Response(
        JSON.stringify({ error: 'No signed URL returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        url: signedUrl.signedUrl,
        filename: filename || resourcePath.split('/').pop() || 'download'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sign-resource-url function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})