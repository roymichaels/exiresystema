/**
 * Send WhatsApp via Twilio REST API directly (no Lovable gateway).
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.
 * Sender number: coach_integrations.twilio_whatsapp_from (E.164, no "whatsapp:" prefix).
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'WhatsApp integration not connected', kind: 'not_connected' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = user.id;

    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    const { data: isPract } = await supabase.rpc('has_role', { _user_id: userId, _role: 'practitioner' });
    if (!isAdmin && !isPract) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { to, body, lead_id } = await req.json();
    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'to and body are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: integ } = await supabase
      .from('coach_integrations')
      .select('twilio_whatsapp_from')
      .eq('user_id', userId)
      .maybeSingle();
    const from = integ?.twilio_whatsapp_from;
    if (!from) {
      return new Response(JSON.stringify({ error: 'No WhatsApp sender configured. Set twilio_whatsapp_from in Integrations.', kind: 'no_sender' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${from}`,
      Body: body,
    });

    const basicAuth = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      },
    );
    const result = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Twilio error', details: result }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (lead_id) {
      await supabase.from('lead_activity').insert({
        lead_id, kind: 'whatsapp', direction: 'outbound',
        body, status: 'sent', external_id: result?.sid ?? null, created_by: userId,
      });
    }

    return new Response(JSON.stringify({ success: true, sid: result?.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
