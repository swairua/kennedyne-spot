import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface StkRequest {
  amount: number;
  phone: string; // international format e.g. +2547xxxxxxx or 07xxxxxxx
  accountReference?: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body: StkRequest = await req.json();
    const { amount, phone, accountReference = 'payment', description = 'Payment' } = body;

    if (!amount || !phone) {
      return new Response(JSON.stringify({ error: 'Missing amount or phone' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load mpesa credentials from site_settings table
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('mpesa_consumer_key, mpesa_consumer_secret, mpesa_short_code, mpesa_passkey, mpesa_callback_url')
      .single();

    if (settingsError || !settings) {
      console.error('Missing mpesa settings', settingsError);
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const {
      mpesa_consumer_key: consumerKey,
      mpesa_consumer_secret: consumerSecret,
      mpesa_short_code: shortCode,
      mpesa_passkey: passkey,
      mpesa_callback_url: callbackUrl
    } = settings as any;

    if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
      return new Response(JSON.stringify({ error: 'Incomplete MPESA configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Obtain OAuth token from Safaricom (sandbox and production differ by URL; use sandbox by default)
    const oauthUrl = Deno.env.get('MPESA_OAUTH_URL') || 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const basic = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResp = await fetch(oauthUrl, { headers: { Authorization: `Basic ${basic}` } });
    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      console.error('OAuth token error', errText);
      return new Response(JSON.stringify({ error: 'Failed to acquire OAuth token' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const tokenJson = await tokenResp.json();
    const accessToken = tokenJson.access_token;

    // Prepare STK push payload
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14); // YYYYMMDDHHmmss
    const password = btoa(`${shortCode}${passkey}${timestamp}`);

    // Normalize phone to international format without '+' (Safaricom expects 2547xxxxxxx)
    let msisdn = phone.replace(/[^0-9]/g, '');
    if (msisdn.startsWith('0')) msisdn = '254' + msisdn.slice(1);
    if (msisdn.startsWith('+')) msisdn = msisdn.slice(1);

    const stkUrl = Deno.env.get('MPESA_STK_URL') || 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const stkBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: msisdn,
      PartyB: shortCode,
      PhoneNumber: msisdn,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: description,
    };

    const stkResp = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkBody)
    });

    const stkJson = await stkResp.json();

    // Store transaction attempt
    const { data: tx, error: txError } = await supabase.from('mpesa_transactions').insert({
      phone: msisdn,
      amount,
      account_reference: accountReference,
      description,
      request_payload: stkBody,
      response_payload: stkJson,
      status: stkJson.ResponseCode === '0' ? 'pending' : 'failed'
    }).select().single();

    if (txError) {
      console.error('Failed to store mpesa transaction', txError);
    }

    return new Response(JSON.stringify({ success: true, data: stkJson, tx_id: tx?.id ?? null }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error in MPESA STK push function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};

serve(handler);
