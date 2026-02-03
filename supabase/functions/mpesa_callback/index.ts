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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    // Safaricom sends nested structure; unify
    const callback = body.Body?.stkCallback ? body.Body.stkCallback : body;

    // Try extract identifiers
    const merchantRequestId = callback?.MerchantRequestID || callback?.MerchantRequestID || (callback?.CheckoutRequestID ? null : null);
    const checkoutRequestId = callback?.CheckoutRequestID || callback?.CheckoutRequestID || (callback?.CheckoutRequestID ? callback.CheckoutRequestID : null);

    // Determine result code if present
    const resultCode = callback?.ResultCode ?? callback?.resultCode ?? (callback?.Result?.ResultCode ?? null);

    // Persist callback
    // Find matching transaction by searching recent transactions where response_payload or request_payload includes MerchantRequestID or CheckoutRequestID
    const { data: recent, error: recErr } = await supabase.from('mpesa_transactions').select('*').order('created_at', { ascending: false }).limit(200);
    if (recErr) console.error('Error fetching transactions for callback match', recErr);

    let matchedId = null;
    if (recent?.length) {
      for (const tx of recent) {
        try {
          const resp = tx.response_payload || {};
          const reqp = tx.request_payload || {};
          if (resp && (resp.MerchantRequestID === merchantRequestId || resp.CheckoutRequestID === checkoutRequestId || resp.merchantRequestID === merchantRequestId || resp.checkoutRequestID === checkoutRequestId)) {
            matchedId = tx.id; break;
          }
          if (reqp && (reqp.MerchantRequestID === merchantRequestId || reqp.CheckoutRequestID === checkoutRequestId)) { matchedId = tx.id; break; }
        } catch (e) { }
      }
    }

    // Update transaction record
    if (matchedId) {
      const updatePayload: any = { callback_payload: callback };
      if (resultCode === 0 || resultCode === '0') updatePayload.status = 'success';
      else if (resultCode) updatePayload.status = 'failed';

      const { error: updateErr } = await supabase.from('mpesa_transactions').update(updatePayload).eq('id', matchedId);
      if (updateErr) console.error('Failed to update transaction with callback', updateErr);
    } else {
      // create a record for unmatched callback for auditing
      const { error: insErr } = await supabase.from('mpesa_transactions').insert({ phone: null, amount: null, account_reference: null, description: 'callback_unmatched', request_payload: null, response_payload: null, callback_payload: callback, status: resultCode === 0 ? 'success' : 'failed' });
      if (insErr) console.error('Failed to insert unmatched callback', insErr);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error in mpesa callback:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};

serve(handler);
