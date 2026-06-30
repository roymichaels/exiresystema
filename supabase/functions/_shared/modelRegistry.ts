/**
 * Model Registry — single source of truth for AI model configuration metadata.
 *
 * Responsibilities (KEEP THESE BOUNDARIES):
 *   - Centralize model IDs per usage category
 *   - Centralize environment variable names for runtime override
 *   - Reference capabilities via MODEL_CAPABILITIES
 *   - Provide typed helpers to look up metadata
 *
 * NOT responsible for:
 *   - Executing model calls (use aiGateway.ts)
 *   - Provider selection logic (handled by caller via getProvider())
 *   - Runtime fallback chains (handled by caller)
 *
 * Usage:
 *   import { Models, getModelId } from "../_shared/modelRegistry.ts";
 *   const model = getModelId("CHAT_FAST");
 *
 * Override via environment (set in Supabase Edge Function secrets):
 *   MODEL_CHAT_FAST=google/gemini-2.5-flash-lite
 */

import type { ModelConfig, ModelRegistry } from "./modelTypes.ts";
import { MODEL_CAPABILITIES } from "./modelCapabilities.ts";

export { type ModelConfig, type ModelRegistry, type ModelCapabilities } from "./modelTypes.ts";
export { MODEL_CAPABILITIES } from "./modelCapabilities.ts";

/**
 * Resolve model ID from environment variable; return default if unset.
 * Uses nullish coalescing so explicitly-set empty string is preserved.
 */
function resolveModel(envVar: string, defaultModel: string): string {
  return Deno.env.get(envVar) ?? defaultModel;
}

/**
 * Central registry of usage categories.
 *
 * Each key represents a distinct usage pattern observed in production Edge
 * Functions. The `id` field is the canonical model identifier; the entry also
 * captures metadata (tier, provider, capabilities) sufficient for routing
 * decisions made by the caller.
 *
 * Categories currently in use across supabase/functions/*:
 *   CHAT_FAST        — default conversational model (most chat functions)
 *   CHAT_QUALITY     — high-quality model (detailed/important outputs)
 *   CHAT_LITE        — low-cost/low-latency free tier
 *   IMAGE            — image output model (gemini-flash-image family)
 *   VISION           — image-input model (gemini vision capability)
 *   ORCHESTRATION    — tool-calling orchestrator (aion-brain)
 *   ARTICLE_BUILDER  — long-form blog article generation
 *   REASONING        — multi-step analytical generation
 *   FALLBACK         — catch-all when request explicitly asks for "openrouter/free"
 */
export const Models: ModelRegistry = {
  CHAT_FAST: {
    id: resolveModel("MODEL_CHAT_FAST", "google/gemini-2.5-flash"),
    displayName: "Chat Fast",
    description: "Default conversational model. Used by most chat Edge Functions.",
    tier: "free",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.5-flash"],
    userTier: "plus",
    defaultTemperature: 0.7,
    suggestedMaxTokens: 2000,
  },

  CHAT_QUALITY: {
    id: resolveModel("MODEL_CHAT_QUALITY", "google/gemini-2.5-pro"),
    displayName: "Chat Quality",
    description: "High-quality model for detailed analysis and important outputs.",
    tier: "premium",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.5-pro"],
    userTier: "apex",
    defaultTemperature: 0.7,
    suggestedMaxTokens: 4000,
  },

  CHAT_LITE: {
    id: resolveModel("MODEL_CHAT_LITE", "google/gemini-2.5-flash-lite"),
    displayName: "Chat Lite",
    description: "Low-cost/low-latency tier. Used for free-tier users and quick responses.",
    tier: "free",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.5-flash-lite"],
    userTier: "free",
    defaultTemperature: 0.7,
    suggestedMaxTokens: 1000,
  },

  IMAGE: {
    id: resolveModel("MODEL_IMAGE", "google/gemini-flash-image"),
    displayName: "Image Generation",
    description: "Image output model for cover images, thumbnails, and visual assets.",
    tier: "premium",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-flash-image"],
    defaultTemperature: 0.8,
    suggestedMaxTokens: 8000,
  },

  VISION: {
    id: resolveModel("MODEL_VISION", "google/gemini-2.5-flash"),
    displayName: "Vision Analysis",
    description: "Model used for image-input requests (gemini-2.5-flash accepts image input).",
    tier: "free",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.5-flash"],
    defaultTemperature: 0.4,
    suggestedMaxTokens: 2000,
  },

  ORCHESTRATION: {
    id: resolveModel("MODEL_ORCHESTRATION", "meta-llama/llama-3.3-70b-instruct:free"),
    displayName: "Orchestration",
    description:
      "Tool-calling model for multi-agent orchestration (aion-brain). " +
      "Override via AION_BRAIN_MODEL env var for backward compatibility.",
    tier: "free",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["meta-llama/llama-3.3-70b-instruct:free"],
    defaultTemperature: 0.0,
    suggestedMaxTokens: 4000,
  },

  ARTICLE_BUILDER: {
    id: resolveModel("MODEL_ARTICLE_BUILDER", "qwen/qwen3.7-plus"),
    displayName: "Article Builder",
    description: "Long-form blog/article generation with business context.",
    tier: "standard",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["qwen/qwen3.7-plus"],
    defaultTemperature: 0.7,
    suggestedMaxTokens: 8000,
  },

  REASONING: {
    id: resolveModel("MODEL_REASONING", "qwen/qwen3.7-plus"),
    displayName: "Reasoning",
    description: "Multi-step analytical generation.",
    tier: "standard",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["qwen/qwen3.7-plus"],
    defaultTemperature: 0.3,
    suggestedMaxTokens: 6000,
  },

  FALLBACK: {
    id: resolveModel("MODEL_FALLBACK", "openrouter/free"),
    displayName: "Fallback",
    description: "Catch-all model used when callers explicitly ask for 'openrouter/free' (intake-chat).",
    tier: "free",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["openrouter/free"],
    defaultTemperature: 0.7,
    suggestedMaxTokens: 2000,
  },
};

/**
 * Typed lookup for a model's ID. Preferred over direct property access.
 */
export function getModelId(key: keyof typeof Models): string {
  return Models[key].id;
}

/**
 * Typed lookup for the full model config.
 */
export function getModelConfig(key: keyof typeof Models): ModelConfig {
  return Models[key];
}

/**
 * Map of hardcoded model IDs observed in the pre-migration codebase to the
 * registry key they should resolve to. Used by migration scripts to detect
 * drift and by legacy code that still passes strings.
 *
 * Keep in sync with the audit output. Remove entries once every Edge Function
 * has migrated off its hardcoded value.
 */
export const LEGACY_MODELS: Record<string, keyof typeof Models> = {
  // Gemini chat models used across 30+ Edge Functions
  "google/gemini-2.5-flash": "CHAT_FAST",
  "google/gemini-2.5-pro": "CHAT_QUALITY",
  "google/gemini-2.5-flash-lite": "CHAT_LITE",
  "google/gemini-2.5-flash-image": "IMAGE",
  "google/gemini-flash-image": "IMAGE",
  "google/gemini-3-flash-preview": "CHAT_FAST",

  // OpenRouter router aliases
  "openrouter/free": "FALLBACK",

  // Orchestration model
  "meta-llama/llama-3.3-70b-instruct:free": "ORCHESTRATION",

  // Article builder
  "qwen/qwen3.7-plus": "ARTICLE_BUILDER",
};
