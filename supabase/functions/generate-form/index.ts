import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = [
  "text", "email", "phone", "textarea", "select", "radio", "checkbox", "rating", "date", "number",
];

const SYSTEM_PROMPT = `You are an expert form & quiz designer for a Hebrew-speaking coaching platform.

Given a free-text brief in Hebrew or English, design a complete form/quiz and return ONLY raw JSON (no markdown, no commentary). Hebrew labels by default unless the brief is clearly English.

Strict JSON schema:
{
  "title": string,
  "description": string,
  "intro_title": string,
  "intro_subtitle": string,
  "thank_you_message": string,
  "fields": [
    {
      "type": "text"|"email"|"phone"|"textarea"|"select"|"radio"|"checkbox"|"rating"|"date"|"number",
      "label": string,
      "placeholder": string,
      "is_required": boolean,
      "options": string[]   // ONLY for select/radio/checkbox, else []
    }
  ]
}

Rules:
- 4–12 fields typically. Always include at least name + one contact field (email or phone) for lead forms.
- For quizzes/assessments, prefer radio/select with 3–5 options each.
- Labels must be clear and conversational.
- Output MUST be valid parseable JSON with no surrounding text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } },
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, intent } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMsg = `Intent: ${intent || "general"}\n\nBrief:\n${prompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "נגמרו הקרדיטים של AI" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      throw new Error(`AI error ${status}: ${text}`);
    }

    const aiData = await response.json();
    let raw = aiData.choices?.[0]?.message?.content || "";
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI did not return JSON");
      parsed = JSON.parse(m[0]);
    }

    // Sanitize
    const fields = Array.isArray(parsed.fields) ? parsed.fields : [];
    const cleanFields = fields
      .filter((f: any) => f && typeof f.label === "string" && ALLOWED_TYPES.includes(f.type))
      .map((f: any, i: number) => ({
        type: f.type,
        label: String(f.label).slice(0, 300),
        placeholder: typeof f.placeholder === "string" ? f.placeholder.slice(0, 300) : "",
        is_required: !!f.is_required,
        options: ["select", "radio", "checkbox"].includes(f.type) && Array.isArray(f.options)
          ? f.options.filter((o: any) => typeof o === "string").slice(0, 20)
          : [],
        order_index: i,
      }));

    const result = {
      title: String(parsed.title || "טופס חדש").slice(0, 200),
      description: String(parsed.description || "").slice(0, 1000),
      intro_title: String(parsed.intro_title || "").slice(0, 200),
      intro_subtitle: String(parsed.intro_subtitle || "").slice(0, 500),
      thank_you_message: String(parsed.thank_you_message || "תודה על מילוי הטופס!").slice(0, 500),
      fields: cleanFields,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-form error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
