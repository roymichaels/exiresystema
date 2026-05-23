// Sends a test email to FOUNDER_NOTIFY_EMAIL using the same Resend pipeline as lead capture.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FOUNDER_NOTIFY_EMAIL = Deno.env.get('FOUNDER_NOTIFY_EMAIL') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  if (!RESEND_API_KEY || !FOUNDER_NOTIFY_EMAIL) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Missing RESEND_API_KEY or FOUNDER_NOTIFY_EMAIL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const subject = '✅ Test email from Exire Systema';
  const html = `
    <div style="font-family:system-ui;line-height:1.6">
      <h2>This is a test email</h2>
      <p>Sent via the same Resend pipeline used for lead capture notifications.</p>
      <p><strong>Recipient (admin):</strong> ${FOUNDER_NOTIFY_EMAIL}</p>
      <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      <hr/>
      <p>If you received this, the notification pipeline is working.</p>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Exire Systema <onboarding@resend.dev>',
        to: [FOUNDER_NOTIFY_EMAIL],
        subject,
        html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, recipient: FOUNDER_NOTIFY_EMAIL, response: data }),
      { status: res.ok ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
