import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface NewsletterSubscription {
  email: string;
  source_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source_url }: NewsletterSubscription = await req.json();

    console.log('Newsletter subscription request:', { email, source_url });

    // Store in database
    const { data: subscription, error: dbError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        source_url: source_url || req.headers.get('referer') || 'unknown',
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Newsletter subscription stored:', subscription.id);

    // Send admin notification email
    try {
      await resend.emails.send({
        from: `${Deno.env.get('RESEND_FROM_NAME')} <${Deno.env.get('RESEND_FROM_ADDRESS')}>`,
        to: ['info@kennedynespot.com'],
        subject: 'New Newsletter Subscription',
        html: `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Source:</strong> ${source_url || 'Unknown'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>ID:</strong> ${subscription.id}</p>
        `,
      });
      console.log('Admin notification sent');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send user confirmation email
    try {
      await resend.emails.send({
        from: `${Deno.env.get('RESEND_FROM_NAME')} <${Deno.env.get('RESEND_FROM_ADDRESS')}>`,
        to: [email],
        subject: 'Welcome to Weekly Market Notes!',
        html: `
          <h2>Welcome to Weekly Market Notes!</h2>
          <p>Thank you for subscribing to our weekly market insights.</p>
          <p>You'll receive valuable trading insights, market analysis, and educational content directly to your inbox every week.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>The KenneDyne spot Team</p>
        `,
      });
      console.log('User confirmation sent');
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
    }

    return new Response(
      JSON.stringify({ success: true, id: subscription.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-newsletter-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process subscription' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
