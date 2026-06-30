// Model capability definitions for the Exire model registry.
// Each model's input/output capabilities are declared here.

export interface ModelCapabilities {
  inputTypes: Array<"text" | "image" | "audio" | "video">;
  outputTypes: Array<"text" | "image" | "audio" | "video" | "json-mode">;
  streaming: boolean;
  costTier: "free" | "standard" | "premium";
  contextWindow?: number; // in tokens
}

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // Google Gemini models
  "google/gemini-2.5-flash": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "free",
    contextWindow: 1_000_000,
  },
  "google/gemini-2.5-flash-vision": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 1_000_000,
  },
  "google/gemini-2.5-pro": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 2_000_000,
  },
  "google/gemini-3-flash-preview": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 2_000_000,
  },
  "google/gemini-3-flash-preview-4k": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "free",
    contextWindow: 4_000,
  },
  "google/gemini-flash-image": {
    inputTypes: ["text"],
    outputTypes: ["image"],
    streaming: false,
    costTier: "premium",
  },

  // OpenAI models
  "openai/gpt-5": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 400_000,
  },
  "openai/gpt-5-mini": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 128_000,
  },
  "openai/gpt-4o": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 128_000,
  },
  "openai/gpt-4o-mini": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 128_000,
  },

  // Anthropic models
  "anthropic/claude-3-5-sonnet-20241022": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 200_000,
  },
  "anthropic/claude-3-5-haiku-20241022": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 200_000,
  },

  // XAI (Grok) models
  "xai/grok-2-vision-1212": {
    inputTypes: ["text", "image", "video"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 131_072,
  },

  // Meta Llama models
  "meta-llama/llama-3.3-70b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 131_072,
  },
  "meta-llama/llama-3.2-90b-vision-instruct": {
    inputTypes: ["text", "image"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 131_072,
  },
  "meta-llama/llama-3.2-3b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "free",
    contextWindow: 131_072,
  },

  // Mistral models
  "mistralai/mistral-large-2411": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 131_072,
  },
  "mistralai/mistral-small-24b-instruct-2501": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 32_768,
  },

  // Qwen models
  "qwen/qwq-32b-preview": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 32_768,
  },
  "qwen/qwen-2.5-coder-32b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 32_768,
  },
  "qwen/qwen-2.5-72b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 128_000,
  },
  "qwen/qwen-2.5-7b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "free",
    contextWindow: 32_768,
  },

  // DeepSeek models
  "deepseek/deepseek-chat": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "standard",
    contextWindow: 64_000,
  },

  // NVIDIA models
  "nvidia/llama-3.1-nemotron-70b-instruct": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 32_768,
  },

  // Cohere models
  "cohere/command-r-plus": {
    inputTypes: ["text"],
    outputTypes: ["text", "json-mode"],
    streaming: true,
    costTier: "premium",
    contextWindow: 128_000,
  },

  // Free/OpenRouter router models
  "openrouter/free": {
    inputTypes: ["text"],
    outputTypes: ["text"],
    streaming: true,
    costTier: "free",
    contextWindow: 32_768,
  },
  "openrouter/auto": {
    inputTypes: ["text"],
    outputTypes: ["text"],
    streaming: true,
    costTier: "standard",
    contextWindow: 128_000,
  },

  // Perplexity models
  "perplexity/llama-3.1-sonar-large-128k-online": {
    inputTypes: ["text"],
    outputTypes: ["text"],
    streaming: false,
    costTier: "standard",
    contextWindow: 128_000,
  },

  // Fallback model (used by intake-chat)
  "openrouter/fast-model": {
    inputTypes: ["text"],
    outputTypes: ["text"],
    streaming: true,
    costTier: "free",
    contextWindow: 32_768,
  },
};
