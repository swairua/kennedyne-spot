import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create supabase client with service role for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client to verify user auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has super_admin role
    const { data: roleCheck, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'super_admin' });

    if (roleError || !roleCheck) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { email, display_name, role } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'missing_required_fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseServiceRole.auth.admin.getUserByEmail(email);
    if (existingUser.user && !checkError) {
      return new Response(JSON.stringify({ error: 'user_already_exists' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Invite the user
    const { data: inviteData, error: inviteError } = await supabaseServiceRole.auth.admin.inviteUserByEmail(email, {
      data: display_name ? { display_name } : undefined,
      redirectTo: `${req.headers.get('origin') || Deno.env.get('SUPABASE_URL')}/auth`
    });

    if (inviteError) {
      console.error('Invite error:', inviteError);
      console.error('Invite error details:', JSON.stringify(inviteError, null, 2));
      
      // Check for common SMTP configuration issues
      if (inviteError.message?.includes('SMTP') || 
          inviteError.message?.includes('email') || 
          inviteError.message?.includes('mail') ||
          inviteError.code === 'email_not_configured') {
        return new Response(JSON.stringify({ 
          error: 'email_not_configured',
          details: 'SMTP is not configured in your Supabase project. Please configure it in Authentication > SMTP settings.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check for rate limiting
      if (inviteError.message?.includes('rate') || inviteError.code === 'rate_limit_exceeded') {
        return new Response(JSON.stringify({ 
          error: 'rate_limit_exceeded',
          details: 'Too many invitations sent. Please wait before sending more.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'invite_failed', 
        details: inviteError.message || 'Unknown error occurred while sending invitation'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inviteData.user) {
      return new Response(JSON.stringify({ error: 'invite_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign the role to the new user
    const { error: roleAssignError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id: inviteData.user.id,
        role: role
      });

    if (roleAssignError) {
      console.error('Role assignment error:', roleAssignError);
      return new Response(JSON.stringify({ error: 'role_assignment_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User invited successfully: ${email} with role: ${role}`);

    return new Response(JSON.stringify({
      user_id: inviteData.user.id,
      email: inviteData.user.email,
      role: role,
      message: 'User invited successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin_invite_user function:', error);
    return new Response(JSON.stringify({ error: 'unknown_error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});