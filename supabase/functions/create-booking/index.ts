/**
 * Create a Google Calendar event + Meet link via the connector gateway.
 * Updates the linked lead to status='scheduled' and logs activity.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GCAL_API_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!LOVABLE_API_KEY || !GCAL_API_KEY) {
      return new Response(JSON.stringify({ error: 'Calendar integration not connected', kind: 'not_connected' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (!claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub;
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    const { data: isPract } = await supabase.rpc('has_role', { _user_id: userId, _role: 'practitioner' });
    if (!isAdmin && !isPract) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    const { lead_id, attendee_email, attendee_name, start_iso, duration_min, summary, description } = await req.json();
    if (!start_iso) {
      return new Response(JSON.stringify({ error: 'start_iso is required' }), { status: 400, headers: corsHeaders });
    }

    const { data: integ } = await supabase
      .from('coach_integrations')
      .select('default_calendar_id, default_session_duration_min')
      .eq('user_id', userId)
      .maybeSingle();
    const calendarId = integ?.default_calendar_id || 'primary';
    const minutes = duration_min || integ?.default_session_duration_min || 60;
    const start = new Date(start_iso);
    const end = new Date(start.getTime() + minutes * 60_000);

    const eventBody = {
      summary: summary || `Session — ${attendee_name || attendee_email || ''}`.trim(),
      description: description || '',
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: attendee_email ? [{ email: attendee_email, displayName: attendee_name }] : undefined,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const url = `${GATEWAY_URL}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GCAL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });
    const event = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Calendar error', details: event }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const meetLink = event?.hangoutLink || event?.conferenceData?.entryPoints?.[0]?.uri;

    if (lead_id) {
      await supabase.from('leads').update({
        status: 'scheduled', contacted_at: new Date().toISOString(),
      }).eq('id', lead_id);
      await supabase.from('lead_activity').insert({
        lead_id, kind: 'booking', direction: 'system',
        subject: eventBody.summary,
        body: `Booked ${start.toISOString()} (${minutes}m)${meetLink ? ` · ${meetLink}` : ''}`,
        status: 'scheduled', external_id: event?.id ?? null,
        payload: { event_id: event?.id, meet_link: meetLink, html_link: event?.htmlLink },
        created_by: userId,
      });
    }

    return new Response(JSON.stringify({
      success: true, event_id: event?.id, meet_link: meetLink, html_link: event?.htmlLink,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
