import type { ModelCapabilities } from "./modelTypes.ts";

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // ===== OpenAI GPT Family =====
  "openai/gpt-5": {
    contextWindow: 400_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 32_000,
    stability: "stable",
  },

  "openai/gpt-4o": {
    contextWindow: 128_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "fast",
    maxOutputTokens: 16_000,
    stability: "stable",
  },

  // ===== Anthropic Claude Family =====
  "anthropic/claude-3.5-sonnet": {
    contextWindow: 200_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  "anthropic/claude-3.5-haiku": {
    contextWindow: 200_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "fast",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  // ===== Google Gemini Family =====
  "google/gemini-2.0-flash-exp": {
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "free",
    latencyTier: "fast",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  "google/gemini-1.5-flash": {
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "free",
    latencyTier: "fast",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  "google/gemini-1.5-pro": {
    contextWindow: 2_000_000,
    supportsVision: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  // ===== X.AI Grok Family =====
  "x-ai/grok-2.5": {
    contextWindow: 131_000,
    supportsVision: false,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 16_000,
    stability: "stable",
  },

  // ===== Meta Llama Family =====
  "meta-llama/llama-3.3-70b-instruct": {
    contextWindow: 131_072,
    supportsVision: false,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "free",
    latencyTier: "standard",
    maxOutputTokens: 4_096,
    stability: "stable",
  },

  // ===== Mistral Family =====
  "mistralai/mistral-large": {
    contextWindow: 128_000,
    supportsVision: false,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 8_000,
    stability: "stable",
  },

  // ===== Qwen Family =====
  "qwen/qwen3-coder": {
    contextWindow: 32_000,
    supportsVision: false,
    supportsStreaming: true,
    supportsImages: false,
    supportsJSON: true,
    supportsReasoning: true,
    supportsToolCalling: true,
    costTier: "premium",
    latencyTier: "standard",
    maxOutputTokens: 4_000,
    stability: "stable",
  },
};
