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

interface ChecklistRequest {
  email: string;
  asset?: string;
  source_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, asset, source_url }: ChecklistRequest = await req.json();

    console.log('Checklist request:', { email, asset, source_url });

    // Store in database
    const { data: request, error: dbError } = await supabase
      .from('checklist_requests')
      .insert({
        email,
        asset: asset || 'drive_checklist',
        source_url: source_url || req.headers.get('referer') || 'unknown',
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Checklist request stored:', request.id);

    // Send admin notification email
    try {
      await resend.emails.send({
        from: `${Deno.env.get('RESEND_FROM_NAME')} <${Deno.env.get('RESEND_FROM_ADDRESS')}>`,
        to: ['info@kennedynespot.com'],
        subject: 'New Checklist Download Request',
        html: `
          <h2>New Checklist Download Request</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asset:</strong> ${asset || 'drive_checklist'}</p>
          <p><strong>Source:</strong> ${source_url || 'Unknown'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>ID:</strong> ${request.id}</p>
        `,
      });
      console.log('Admin notification sent');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send user confirmation email with download link
    try {
      await resend.emails.send({
        from: `${Deno.env.get('RESEND_FROM_NAME')} <${Deno.env.get('RESEND_FROM_ADDRESS')}>`,
        to: [email],
        subject: 'Your Trading Checklist is Ready!',
        html: `
          <h2>Your Trading Checklist is Ready!</h2>
          <p>Thank you for requesting our trading checklist. This comprehensive guide will help you develop a systematic approach to trading.</p>
          <p><strong>Download your checklist here:</strong><br>
          <a href="https://drive.google.com/file/d/1abc123example/view" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Download Trading Checklist</a></p>
          <p>This checklist includes:</p>
          <ul>
            <li>Pre-market analysis steps</li>
            <li>Trade setup validation</li>
            <li>Risk management guidelines</li>
            <li>Post-trade review process</li>
          </ul>
          <p>If you have any questions about implementing this checklist, feel free to contact us.</p>
          <p>Best regards,<br>The KenneDyne spot Team</p>
        `,
      });
      console.log('User confirmation sent');
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
    }

    return new Response(
      JSON.stringify({ success: true, id: request.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-checklist-request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
