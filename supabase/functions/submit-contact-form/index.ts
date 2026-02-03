import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
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

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactSubmission = await req.json();

    console.log('Received contact form submission:', { name, email, subject });

    // Store in database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone,
        subject,
        message
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save submission: ${dbError.message}`);
    }

    console.log('Contact submission saved to database:', submission.id);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "KenneDyne spot <notifications@kennedynespot.com>",
      to: ["info@kennedynespot.com"],
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <p><a href="https://institutional-trader.com/admin/leads">View in Admin Panel</a></p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error('Admin email error:', adminEmailResponse.error);
    } else {
      console.log('Admin notification sent successfully');
    }

    // Send confirmation email to user
    const confirmationResponse = await resend.emails.send({
      from: "KenneDyne spot <hello@kennedynespot.com>",
      to: [email],
      subject: "We received your message!",
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We have received your message about "${subject}" and will get back to you within 24-48 hours during business days.</p>
        
        <h3>Your message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        
        <p>If you need immediate assistance, you can reach us on WhatsApp: +254 101 316 169</p>
        
        <p>Best regards,<br>The KenneDyne spot Team</p>
      `,
    });

    if (confirmationResponse.error) {
      console.error('Confirmation email error:', confirmationResponse.error);
    } else {
      console.log('Confirmation email sent successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully',
        id: submission.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-contact-form function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to submit message',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
