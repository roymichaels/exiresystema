/**
 * Model Types for Central AI Registry
 * 
 * Defines type-safe interfaces for AI model configuration.
 * All models should be defined here and referenced via the registry.
 */

export type ModelTier = "free" | "standard" | "premium" | "experimental";

export type ModelProvider = "openrouter" | "lovable" | "custom";

export type ModelCapability =
  | "text"
  | "vision"
  | "image-generation"
  | "streaming"
  | "json-mode"
  | "tool-calling"
  | "long-context";

/**
 * Metadata describing what a model can do
 */
export interface ModelCapabilities {
  /** Primary content type the model processes */
  inputTypes: ModelCapability[];
  
  /** Output formats the model supports */
  outputTypes: ModelCapability[];
  
  /** Whether the model supports streaming responses */
  streaming: boolean;
  
  /** Maximum context window in tokens */
  contextWindow?: number;
  
  /** Whether this model is production-ready or experimental */
  stability: "stable" | "preview" | "experimental";
}

/**
 * Configuration for a single model entry in the registry
 */
export interface ModelConfig {
  /** Model identifier (e.g., "google/gemini-2.5-flash") */
  id: string;
  
  /** Human-readable display name */
  displayName: string;
  
  /** Brief description of the model's purpose and strengths */
  description: string;
  
  /** Cost tier for budgeting and rate limiting decisions */
  tier: ModelTier;
  
  /** Primary provider for this model */
  provider: ModelProvider;
  
  /** Detailed capability metadata */
  capabilities: ModelCapabilities;
  
  /** 
   * Recommended default temperature (0.0 - 1.0)
   * Lower = more deterministic, higher = more creative
   */
  defaultTemperature?: number;
  
  /**
   * Suggested max tokens for output generation
   * Override per-use-case as needed
   */
  suggestedMaxTokens?: number;
}

/**
 * Registry of all available models, keyed by usage identifier
 */
export type ModelRegistry = Record<string, ModelConfig>;
