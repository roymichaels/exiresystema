//!/usr/bin/env deno
// Supabase Edge Function: generate-blog-article
// BizOS Article Builder - OpenRouter only implementation (ARTICLE_BUILDER_TEXT_OPENROUTER_V1)
// AI policy: Use OpenRouter exclusively, no Lovable fallback
// SECURITY: Strict environment-only API key handling for BizOS Article Builder

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Business context type for tenant/business awareness
interface BusinessContext {
  tenantId: string;
  businessName: string;
  businessType: string;
  brandVoice: string;
  targetAudience: string;
}

// Local OpenRouter helper - NO aiGateway.ts usage or parameter overrides
// SECURITY: Only environment variable reading, no external apiKey acceptance
async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string
) {
  // SECURITY: Strict environment-only API key reading - no hardcoded keys
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured. BizOS Article Builder requires OpenRouter for text generation.");
  }

  const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
  // ARTICLE_BUILDER_TEXT_OPENROUTER_V1: paid/credit-backed model, env-configurable
  const ARTICLE_BUILDER_MODEL =
    Deno.env.get("ARTICLE_BUILDER_MODEL") || "qwen/qwen3.7-plus";

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://exire-systema.com",
      "X-Title": "Exire Systema"
    },
    body: JSON.stringify({
      model: ARTICLE_BUILDER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    if (response.status === 429) {
      throw new Error("Rate limited, try again later");
    }
    if (response.status === 402) {
      throw new Error("API credits exhausted, please add credits");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Authentication failed with OpenRouter");
    }
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing auth header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    // Parse request with optional tenant/business fields
    const parsed = await req.json();
    const {
      prompt,
      language = "both",
      generateImage = true,
      tenantId,
      businessName,
      businessType,
      brandVoice,
      targetAudience
    } = parsed;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Business context with defaults - BizOS platform, Exire Systema tenant
    const business: BusinessContext = {
      tenantId: tenantId || "exire-systema",
      businessName: businessName || "Exire Systema",
      businessType: businessType || "Personal Development Platform",
      brandVoice: brandVoice || "Professional, direct, useful",
      targetAudience: targetAudience || "Individuals seeking personal growth and transformation",
    };

    // Step 1: Generate article content using OpenRouter with tenant/business context
    const systemPrompt = `You are an expert SEO content writer and digital strategist for ${business.businessName} (${business.businessType}) — a BizOS platform tenant. Leveraging ${business.brandVoice} voice to create engaging, valuable content.\n\nWrite a complete, high-quality blog article based on the user's prompt.\n\nCRITICAL RULES:\n|- Return a valid JSON object ONLY, no markdown fences\n|- The article must be genuinely valuable, not generic fluff\n|- Use engaging, conversational tone that's SEO-optimized\n|- Include semantic HTML in content (h2, h3, p, ul, li, strong, em, blockquote)\n|- Naturally weave in keywords without stuffing\n|- Write at least 1200 words per language version\n\nINTEGRATION RULES:\n|- Include a \"How ${business.businessName} Approaches This\" H2 section near the end\n|- Final CTA: \"Ready to learn more? <a href=\"https://exire-systema.com\">Discover your transformation journey →</a>\"\n\nJSON structure:\n{\n  \"title\": \"${business.businessName} Blog Article about [topic]\",\n  \"title_he\": \"[Hebrew title]\",\n  \"slug\": \"${business.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}\",\n  \"excerpt\": \"Comprehensive guide to [topic] from ${business.businessName}\",\n  \"excerpt_he\": \"[Hebrew excerpt]\",\n  \"content\": \"[Full English article with semantic HTML]\",\n  \"content_he\": \"[Full Hebrew article with semantic HTML]\",\n  \"meta_title\": \"Ultimate Guide: [topic] with ${business.businessName}\",\n  \"meta_description\": \"Learn about [topic] from ${business.businessName}'s expert perspective.\",\n  \"meta_keywords\": \"${business.businessName}, [topic], personal development, transformation\",\n  \"tags\": [\"${business.businessType.replace(/ /g, '-').toLowerCase()}\", \"personal-growth\", \"transformation\"],\n  \"reading_time_minutes\": 8,\n  \"image_prompt\": \"A vivid, detailed prompt for generating a cover image that matches the article theme. Modern, editorial style. No text.\"\n}`;

    // Step 2: Call OpenRouter using the helper function (no additional parameters)
    const result = await callOpenRouter(systemPrompt, `Write an article about: ${prompt}\n\nLanguage: ${language === "both" ? "Generate both English AND Hebrew versions" : language === "he" ? "Generate Hebrew version (leave English fields empty)" : "Generate English version (leave Hebrew fields empty)"}`);

    let rawContent = result.choices?.[0]?.message?.content || "";
    
    // Clean up potential markdown fences
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Extract JSON object if surrounded by other text
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawContent = jsonMatch[0];
    }

    let article;
    try {
      article = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("JSON parse failed, attempting recovery. Raw length:", rawContent.length, "Error:", parseErr);
      try {
        let repaired = rawContent
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        article = JSON.parse(repaired);
      } catch {
        try {
          // Sanitize unescaped control characters
          let sanitized = rawContent.replace(/(?<!\\)[\x00-\x1F\x7F]/g, (ch) => {
            if (ch === '\n') return '\\n';
            if (ch === '\r') return '\\r';
            if (ch === '\t') return '\\t';
            return '';
          });
          sanitized = sanitized.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          article = JSON.parse(sanitized);
        } catch {
          console.error("All JSON parse attempts failed. First 500 chars:", rawContent.substring(0, 500));
          throw new Error("Failed to parse AI response as JSON after sanitization");
        }
      }
    }

    // Step 3: Generate cover image if requested (DEFERRED - placeholder)
    let coverImageUrl: string | null = null;
    if (generateImage && article.image_prompt) {
      // TODO: Migrate image generation to an approved OpenRouter-compatible image provider/model in a separate phase.
      // For now, skip Lovable image generation to maintain OpenRouter-only text generation.
      console.log("Image generation deferred - requires OpenRouter-compatible image provider");
      // coverImageUrl remains null
    }

    // Step 4: Save to database
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure unique slug by appending timestamp suffix
    const baseSlug = (article.slug || `post-${Date.now()}`).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data: post, error: insertError } = await serviceClient
      .from("blog_posts")
      .insert({
        title: article.title || "Untitled",
        title_he: article.title_he || null,
        slug: uniqueSlug,
        excerpt: article.excerpt || null,
        excerpt_he: article.excerpt_he || null,
        content: article.content || "",
        content_he: article.content_he || null,
        cover_image_url: coverImageUrl,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || article.excerpt,
        meta_keywords: article.meta_keywords || "",
        tags: article.tags || [],
        reading_time_minutes: article.reading_time_minutes || 5,
        author_id: user.id,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-article error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});