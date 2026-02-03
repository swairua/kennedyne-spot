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

interface MentorshipApplication {
  name: string;
  email: string;
  phone?: string;
  experience: string;
  goals: string;
  availability: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, experience, goals, availability }: MentorshipApplication = await req.json();

    console.log('Received mentorship application:', { name, email, phone });

    // Store in database
    const { data: application, error: dbError } = await supabase
      .from('mentorship_applications')
      .insert({
        name,
        email,
        phone,
        experience,
        goals,
        availability
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save application: ${dbError.message}`);
    }

    console.log('Application saved to database:', application.id);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "KenneDyne spot <notifications@kennedynespot.com>",
      to: ["info@kennedynespot.com"],
      subject: `New Mentorship Application from ${name}`,
      html: `
        <h2>New Mentorship Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Availability:</strong> ${availability}</p>
        
        <h3>Trading Experience:</h3>
        <p>${experience.replace(/\n/g, '<br>')}</p>
        
        <h3>Goals:</h3>
        <p>${goals.replace(/\n/g, '<br>')}</p>
        
        <p><a href="https://institutional-trader.com/admin/leads">View in Admin Panel</a></p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error('Admin email error:', adminEmailResponse.error);
    } else {
      console.log('Admin notification sent successfully');
    }

    // Send confirmation email to applicant
    const confirmationResponse = await resend.emails.send({
      from: "KenneDyne spot <hello@kennedynespot.com>",
      to: [email],
      subject: "Mentorship Application Received",
      html: `
        <h2>Thank you for your application, ${name}!</h2>
        <p>We've received your mentorship application and will review it within 48 hours.</p>
        
        <h3>What happens next?</h3>
        <ul>
          <li>Our team will review your application</li>
          <li>We'll contact you within 48 hours via email or WhatsApp</li>
          <li>If accepted, we'll schedule a brief call to discuss your goals</li>
        </ul>
        
        <p>If you have any questions, feel free to reach out via WhatsApp: +254 101 316 169</p>
        
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
        message: 'Application submitted successfully',
        id: application.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-mentorship-application function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to submit application',
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
