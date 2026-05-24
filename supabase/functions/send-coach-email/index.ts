import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email integration not connected' }), {
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
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await supabase.auth.getClaims(token);
    if (!claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub;

    // Authorize: admin or practitioner only
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    const { data: isPract } = await supabase.rpc('has_role', { _user_id: userId, _role: 'practitioner' });
    if (!isAdmin && !isPract) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { to, subject, html, text, lead_id, from } = body as {
      to: string; subject: string; html?: string; text?: string; lead_id?: string; from?: string;
    };
    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ error: 'to, subject, and html or text are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load coach signature/from override
    const { data: integ } = await supabase
      .from('coach_integrations')
      .select('email_from, email_signature')
      .eq('user_id', userId)
      .maybeSingle();

    const fromAddr = from || integ?.email_from || 'Exire Systema <onboarding@resend.dev>';
    const finalHtml = (html || `<p>${text}</p>`) + (integ?.email_signature ? `<br/><br/><div style="color:#888;font-size:12px">${integ.email_signature}</div>` : '');

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: fromAddr, to: [to], subject, html: finalHtml }),
    });
    const result = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: result?.message || 'Send failed', details: result }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log activity
    if (lead_id) {
      await supabase.from('lead_activity').insert({
        lead_id, kind: 'email', direction: 'outbound',
        subject, body: text || html, status: 'sent',
        external_id: result?.id ?? null, created_by: userId,
      });
    }

    return new Response(JSON.stringify({ success: true, id: result?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
