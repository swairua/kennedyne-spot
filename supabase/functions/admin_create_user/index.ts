import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create Supabase client for user verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the user making the request
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has super_admin role
    const { data: hasRole, error: roleError } = await supabaseServiceRole
      .rpc('has_role', { _user_id: user.id, _role: 'super_admin' });

    if (roleError || !hasRole) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, display_name, role, password } = await req.json();

    if (!email || !display_name || !role || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, display_name, role, password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user with email: ${email}, role: ${role}`);

    // Check if user already exists
    const { data: existingUser } = await supabaseServiceRole.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'user_already_exists',
          message: 'A user with this email already exists'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        display_name
      },
      email_confirm: true // Auto-confirm email since admin is creating it
    });

    if (createError) {
      console.error('User creation error:', createError);
      return new Response(
        JSON.stringify({ 
          error: 'user_creation_failed',
          message: createError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ 
          error: 'user_creation_failed',
          message: 'User creation returned no user data'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User created successfully: ${newUser.user.id}`);

    // Assign role to the new user
    const { error: roleAssignError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role
      });

    if (roleAssignError) {
      console.error('Role assignment error:', roleAssignError);
      // Try to clean up the created user if role assignment fails
      await supabaseServiceRole.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'role_assignment_failed',
          message: roleAssignError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Role ${role} assigned successfully to user ${newUser.user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User created successfully with ${role} role`,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          display_name
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin_create_user function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'internal_server_error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});