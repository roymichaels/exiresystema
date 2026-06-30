/**
 * Central AI Model Registry
 *
 * Single source of truth for model selection, configuration, and routing metadata.
 * Does NOT handle execution, provider logic, or runtime fallbacks.
 *
 * @fileoverview This file defines:
 * - Model capabilities (what each model CAN do)
 * - Model registry (metadata about each model)
 * - Routing rules (how to CHOOSE models for tasks)
 */

import type { ModelCapabilities, ModelConfig, RoutingRule } from "./modelTypes.js";
import { MODEL_CAPABILITIES } from "./modelCapabilities.js";

// ===== Model Registry =====

export const MODELS: Record<string, ModelConfig> = {
  // Premium general-purpose models
  "openai/gpt-5": {
    id: "openai/gpt-5",
    displayName: "GPT-5",
    description: "OpenAI's most capable model with advanced reasoning",
    provider: "openai",
    capabilities: MODEL_CAPABILITIES["openai/gpt-5"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 16000, stream: true },
    aliases: ["gpt-5", "gpt5"],
  },
  "anthropic/claude-3.5-sonnet": {
    id: "anthropic/claude-3.5-sonnet",
    displayName: "Claude 3.5 Sonnet",
    description: "Anthropic's balanced model with strong reasoning",
    provider: "anthropic",
    capabilities: MODEL_CAPABILITIES["anthropic/claude-3.5-sonnet"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["claude-3.5-sonnet", "claude-sonnet"],
  },
  "x-ai/grok-2.5": {
    id: "x-ai/grok-2.5",
    displayName: "Grok 2.5",
    description: "X.AI's capable model for complex tasks",
    provider: "x-ai",
    capabilities: MODEL_CAPABILITIES["x-ai/grok-2.5"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 16000, stream: true },
    aliases: ["grok-2.5", "grok"],
  },

  // Fast general-purpose models
  "openai/gpt-4o": {
    id: "openai/gpt-4o",
    displayName: "GPT-4o",
    description: "OpenAI's fast and capable all-rounder",
    provider: "openai",
    capabilities: MODEL_CAPABILITIES["openai/gpt-4o"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 16000, stream: true },
    aliases: ["gpt-4o", "gpt4o"],
  },
  "anthropic/claude-3.5-haiku": {
    id: "anthropic/claude-3.5-haiku",
    displayName: "Claude 3.5 Haiku",
    description: "Anthropic's fast and cost-effective model",
    provider: "anthropic",
    capabilities: MODEL_CAPABILITIES["anthropic/claude-3.5-haiku"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["claude-3.5-haiku", "claude-haiku"],
  },

  // Free-tier models
  "google/gemini-2.0-flash-exp": {
    id: "google/gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash",
    description: "Google's fast experimental model with large context",
    provider: "google",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.0-flash-exp"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["gemini-2.0-flash", "gemini-2.0"],
  },
  "google/gemini-1.5-flash": {
    id: "google/gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    description: "Google's reliable fast model",
    provider: "google",
    capabilities: MODEL_CAPABILITIES["google/gemini-1.5-flash"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["gemini-1.5-flash", "gemini-flash"],
  },
  "google/gemini-1.5-pro": {
    id: "google/gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    description: "Google's capable model with 2M context window",
    provider: "google",
    capabilities: MODEL_CAPABILITIES["google/gemini-1.5-pro"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["gemini-1.5-pro"],
  },
  "meta-llama/llama-3.3-70b-instruct": {
    id: "meta-llama/llama-3.3-70b-instruct",
    displayName: "Llama 3.3 70B",
    description: "Meta's open-source 70B parameter model",
    provider: "meta-llama",
    capabilities: MODEL_CAPABILITIES["meta-llama/llama-3.3-70b-instruct"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 4096, stream: true },
    aliases: ["llama-3.3-70b", "llama-70b"],
  },

  // Specialized models
  "mistralai/mistral-large": {
    id: "mistralai/mistral-large",
    displayName: "Mistral Large",
    description: "Mistral's flagship model",
    provider: "mistral",
    capabilities: MODEL_CAPABILITIES["mistralai/mistral-large"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["mistral-large"],
  },
  "qwen/qwen3-coder": {
    id: "qwen/qwen3-coder",
    displayName: "Qwen3 Coder",
    description: "Alibaba's code-specialized model",
    provider: "qwen",
    capabilities: MODEL_CAPABILITIES["qwen/qwen3-coder"],
    defaultConfig: { temperature: 0.7, topP: 1, maxTokens: 8000, stream: true },
    aliases: ["qwen3-coder", "qwen-coder"],
  },
};

// ===== Routing Rules =====

export const ROUTING: RoutingRule[] = [
  {
    type: "chat",
    preferredModel: "openai/gpt-4o",
    fallbacks: ["anthropic/claude-3.5-haiku", "google/gemini-2.0-flash-exp"],
    constraints: {
      maxResponseTimeMs: 3000,
      maxTokensPerRequest: 4000,
    },
    description: "General conversational chat - prioritize speed and cost-effectiveness",
  },
  {
    type: "vision",
    preferredModel: "openai/gpt-4o",
    fallbacks: ["anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-exp"],
    constraints: {
      requiresVision: true,
      maxTokensPerRequest: 4000,
    },
    description: "Image analysis and understanding",
  },
  {
    type: "orchestration",
    preferredModel: "openai/gpt-5",
    fallbacks: ["anthropic/claude-3.5-sonnet", "x-ai/grok-2.5"],
    constraints: {
      requiresToolCalling: true,
      maxTokensPerRequest: 8000,
    },
    description: "System orchestration and agent coordination",
  },
  {
    type: "article",
    preferredModel: "anthropic/claude-3.5-sonnet",
    fallbacks: ["openai/gpt-5", "x-ai/grok-2.5"],
    constraints: {
      maxTokensPerRequest: 8000,
    },
    description: "Long-form content generation (blog posts, articles)",
  },
  {
    type: "code",
    preferredModel: "anthropic/claude-3.5-sonnet",
    fallbacks: ["qwen/qwen3-coder", "openai/gpt-5"],
    constraints: {
      requiresToolCalling: true,
      maxTokensPerRequest: 8000,
    },
    description: "Code generation, refactoring, and analysis",
  },
  {
    type: "reasoning",
    preferredModel: "anthropic/claude-3.5-sonnet",
    fallbacks: ["openai/gpt-5", "x-ai/grok-2.5"],
    constraints: {
      maxTokensPerRequest: 4000,
    },
    description: "Complex multi-step reasoning and analysis",
  },
  {
    type: "fallback",
    preferredModel: "google/gemini-2.0-flash-exp",
    fallbacks: ["google/gemini-1.5-flash", "meta-llama/llama-3.3-70b-instruct"],
    constraints: {
      maxResponseTimeMs: 5000,
    },
    description: "Default fallback when primary models unavailable",
  },
  {
    type: "image",
    preferredModel: "openai/gpt-4o",
    fallbacks: ["anthropic/claude-3.5-sonnet"],
    constraints: {
      requiresVision: true,
      requiresToolCalling: true,
    },
    description: "Image generation and processing",
  },
];

// ===== Utility Functions =====

/**
 * Get a model configuration by ID
 */
export function getModel(id: string): ModelConfig | null {
  return MODELS[id] ?? null;
}

/**
 * Get a model configuration by alias
 */
export function getModelByAlias(alias: string): ModelConfig | null {
  for (const model of Object.values(MODELS)) {
    if (model.aliases.includes(alias)) {
      return model;
    }
  }
  return null;
}

/**
 * Resolve a model name or alias to a ModelConfig
 */
export function resolveModel(nameOrAlias: string): ModelConfig | null {
  return getModel(nameOrAlias) ?? getModelByAlias(nameOrAlias);
}

/**
 * Get the routing rule for a task type
 */
export function getRoutingRule(taskType: RoutingRule["type"]): RoutingRule | undefined {
  return ROUTING.find((rule) => rule.type === taskType);
}

/**
 * Validate that a configuration satisfies model capabilities
 */
export function validateConfig(
  modelId: string,
  config: Partial<ModelConfig["defaultConfig"]>
): { valid: boolean; errors: string[] } {
  const model = getModel(modelId);
  if (!model) {
    return { valid: false, errors: [`Model not found: ${modelId}`] };
  }

  const errors: string[] = [];

  if (config.maxTokens !== undefined) {
    if (config.maxTokens > model.capabilities.maxOutputTokens) {
      errors.push(
        `maxTokens (${config.maxTokens}) exceeds model's maximum (${model.capabilities.maxOutputTokens})`
      );
    }
    if (config.maxTokens < 1) {
      errors.push(`maxTokens must be at least 1, got ${config.maxTokens}`);
    }
  }

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      errors.push(`temperature must be between 0 and 2, got ${config.temperature}`);
    }
  }

  if (config.topP !== undefined) {
    if (config.topP < 0 || config.topP > 1) {
      errors.push(`topP must be between 0 and 1, got ${config.topP}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get all available models
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(MODELS);
}

/**
 * Get models filtered by capability
 */
export function getModelsByCapability(capability: keyof ModelCapabilities): ModelConfig[] {
  return Object.values(MODELS).filter((model) => {
    const cap = model.capabilities[capability];
    return typeof cap === "boolean" ? cap : cap > 0;
  });
}

/**
 * Get models filtered by tier
 */
export function getModelsByTier(tier: ModelCapabilities["costTier"]): ModelConfig[] {
  return Object.values(MODELS).filter((model) => model.capabilities.costTier === tier);
}

/**
 * Check if a model is available (not deprecated or experimental)
 */
export function isModelAvailable(modelId: string): boolean {
  const model = getModel(modelId);
  return model !== null && model.capabilities.stability === "stable";
}

// ===== Re-exports for convenience =====

export type { ModelCapabilities, ModelConfig, RoutingRule };
