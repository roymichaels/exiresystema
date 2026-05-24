import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const status = {
    email:    Deno.env.get('RESEND_API_KEY')          ? 'connected' : 'not_connected',
    whatsapp: Deno.env.get('TWILIO_API_KEY')          ? 'connected' : 'not_connected',
    calendar: Deno.env.get('GOOGLE_CALENDAR_API_KEY') ? 'connected' : 'not_connected',
    stripe:   Deno.env.get('STRIPE_SECRET_KEY')       ? 'connected' : 'not_connected',
  };

  return new Response(JSON.stringify(status), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
