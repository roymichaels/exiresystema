export interface ModelCapabilities {
  contextWindow: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsJSON: boolean;
  supportsReasoning: boolean;
  supportsToolCalling: boolean;
  costTier: "free" | "premium";
  latencyTier: "fast" | "standard" | "slow";
  maxOutputTokens: number;
  stability: "stable" | "experimental" | "deprecated";
}

export interface ModelConfig {
  id: string;
  displayName: string;
  description: string;
  provider: string;
  capabilities: typeof import("./modelCapabilities.js").MODEL_CAPABILITIES[string];
  defaultConfig: ModelDefaultConfig;
  aliases: string[];
}

export interface ModelDefaultConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  stream: boolean;
}

export interface RoutingRule {
  type: "chat" | "vision" | "orchestration" | "article" | "code" | "reasoning" | "fallback" | "image";
  preferredModel: string;
  fallbacks: string[];
  constraints?: {
    maxTokensPerRequest?: number;
    maxResponseTimeMs?: number;
    requiresVision?: boolean;
    requiresToolCalling?: boolean;
  };
  description: string;
}

export interface ModelRegistry {
  models: ModelConfig[];
  routing: RoutingRule[];
}
