# Model Registry Documentation

## Overview

The Model Registry is the **single source of truth** for all AI model configurations in the Exire Systema codebase. It provides a centralized, type-safe, environment-driven approach to model selection across Edge Functions, frontend applications, and automation scripts.

## Architecture

```
supabase/functions/_shared/
├── modelTypes.ts              # Type definitions
├── modelCapabilities.ts       # Model metadata & capabilities
└── modelRegistry.ts           # Central registry with env-var resolution
```

### Layers

1. **Type Definitions** (`modelTypes.ts`)
   - Defines TypeScript interfaces for model metadata, capabilities, and configuration
   - Ensures type safety across the entire model system

2. **Capabilities** (`modelCapabilities.ts`)
   - Static metadata about each model's capabilities (vision support, streaming, etc.)
   - Used for runtime validation and capability checks

3. **Registry** (`modelRegistry.ts`)
   - Single source of truth for all model identifiers
   - Resolves environment variables over hardcoded defaults
   - Provides helper functions for model lookup and validation

## Naming Convention

All model registry keys follow this pattern:

```typescript
UsageCategory_Subcategory: {
  id: string;                    // Actual model identifier
  displayName: string;           // Human-readable name
  description: string;           // Purpose and strengths
  tier: "free" | "standard" | "premium";
  provider: "openrouter" | "lovable";
  capabilities: ModelCapabilities;
  defaultTemperature?: number;
  suggestedMaxTokens?: number;
}
```

### Usage Categories

- **`CHAT_FAST`** — Fast responses for conversational UI, quick completions
- **`CHAT_QUALITY`** — High-quality output for blog generation, detailed analysis
- **`CHAT_LITE`** — Lightweight tasks, low-latency interactions
- **`IMAGE_GENERATION`** — Image creation and manipulation
- **`VISION`** — Image understanding and analysis
- **`EMBEDDING`** — Text embedding for search, similarity
- **`CODE_GENERATION`** — Code completion, refactoring
- **`REASONING`** — Complex logic, multi-step reasoning
- **`SUMMARIZATION`** — Text summarization, compression
- **`TRANSLATION`** — Language translation

### Subcategories

When multiple models serve the same usage category, add a subcategory suffix:

```typescript
SUMMARIZATION_NARRATIVE: ...
SUMMARIZATION_TECHNICAL: ...
```

## Environment Variables

All models can be overridden via environment variables:

```bash
# Override default models
MODEL_CHAT_FAST=google/gemini-2.5-flash
MODEL_CHAT_QUALITY=google/gemini-2.5-pro
MODEL_IMAGE_GENERATION=google/gemini-2.5-flash-image

# Add new models for specific use cases
MODEL_CHAT_QUALITY_BLOG=google/gemini-2.5-pro
MODEL_REASONING_COMPLEX=anthropic/claude-3-opus-20240229
```

**Resolution Order:**

1. Environment variable (e.g., `MODEL_CHAT_FAST`)
2. Default value in registry

## How to Add a New Model

### Step 1: Add to Capabilities

```typescript
// modelCapabilities.ts
export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  "openai/gpt-4-turbo-preview": {
    supportsVision: false,
    supportsStreaming: true,
    supportsImages: false,
    supportsReasoning: true,
    supportsJSON: true,
    maxTokens: 128000,
    costTier: "standard",
    inputTypes: ["text"],
    outputTypes: ["text", "json"],
  },
};
```

### Step 2: Add to Registry

```typescript
// modelRegistry.ts
export const Models = {
  CHAT_QUALITY: {
    id: Deno.env.get("MODEL_CHAT_QUALITY") ?? "google/gemini-2.5-pro",
    displayName: "Chat Quality",
    description: "High-quality conversational output with strong reasoning",
    tier: "premium",
    provider: "openrouter",
    capabilities: MODEL_CAPABILITIES["google/gemini-2.5-pro"],
    defaultTemperature: 0.7,
    suggestedMaxTokens: 2000,
  },
};
```

### Step 3: Document the Model

Add to this README under the "Available Models" section (below).

## Usage Examples

### Basic Model Lookup

```typescript
import { Models } from "../_shared/modelRegistry.ts";

const model = Models.CHAT_FAST;
console.log(model.id); // "google/gemini-2.5-flash" (or env override)
```

### With Helper Functions

```typescript
import { getModelId, getModelConfig } from "../_shared/modelRegistry.ts";

const modelId = getModelId("CHAT_FAST");
const config = getModelConfig("CHAT_FAST");
```

### Using with aiGateway

```typescript
import { Models } from "../_shared/modelRegistry.ts";
import { aiGateway } from "../_shared/aiGateway.ts";

const response = await aiGateway({
  model: Models.CHAT_FAST.id,
  messages: [{ role: "user", content: "Hello" }],
});
```

### Capability Check

```typescript
import { Models } from "../_shared/modelRegistry.ts";

if (Models.CHAT_FAST.capabilities.supportsVision) {
  // Model supports image input
}
```

## Migration Strategy

### Current State (Pre-Migration)

Currently, 40+ Edge Functions hardcode model identifiers directly in code:

```typescript
// ❌ BAD: Hardcoded model
let widgetModel = "google/gemini-2.5-flash";
```

### Target State (Post-Migration)

All Edge Functions should use the registry:

```typescript
// ✅ GOOD: Registry lookup with env override
import { Models } from "../_shared/modelRegistry.ts";
const model = Models.CHAT_FAST.id; // Resolves to env var or default
```

### Migration Work Orders

1. **MODEL_ROUTING_EDGE_FUNCTIONS_V1** — Migrate 10 critical Edge Functions
2. **MODEL_ROUTING_EDGE_FUNCTIONS_V2** — Migrate remaining 30+ Edge Functions
3. **MODEL_ROUTING_FRONTEND_V1** — Migrate frontend applications
4. **MODEL_ROUTING_DOCS_V1** — Update documentation to match registry

### Migration Checklist

For each Edge Function:

- [ ] Import from `modelRegistry.ts`
- [ ] Replace hardcoded model with registry lookup
- [ ] Add environment variable to `.env` (if needed)
- [ ] Test with default model
- [ ] Test with environment override
- [ ] Update function documentation

## Available Models

### Chat Models

| Registry Key | Model ID | Tier | Provider | Use Case |
|--------------|----------|------|----------|----------|
| `CHAT_FAST` | `google/gemini-2.5-flash` | free | OpenRouter | Fast conversational UI |
| `CHAT_QUALITY` | `google/gemini-2.5-pro` | premium | OpenRouter | High-quality output |
| `CHAT_LITE` | `google/gemini-2.5-flash-lite` | free | OpenRouter | Lightweight tasks |

### Image Models

| Registry Key | Model ID | Tier | Provider | Use Case |
|--------------|----------|------|----------|----------|
| `IMAGE_GENERATION` | `google/gemini-2.5-flash-image` | premium | OpenRouter | Image creation |
| `VISION` | `google/gemini-2.5-flash` | free | OpenRouter | Image understanding |

### Specialized Models

| Registry Key | Model ID | Tier | Provider | Use Case |
|--------------|----------|------|----------|----------|
| `REASONING` | `google/gemini-2.5-pro` | premium | OpenRouter | Complex logic |
| `EMBEDDING` | `openai/text-embedding-3-small` | standard | OpenRouter | Text embeddings |
| `CODE_GENERATION` | `google/gemini-2.5-flash` | free | OpenRouter | Code completion |

## Provider Support

### OpenRouter

- **Primary provider** for all models
- Supports OpenAI, Anthropic, Google, Meta models
- Requires `OPENROUTER_API_KEY` environment variable
- Model IDs format: `provider/model-name`

### Lovable Gateway

- **Fallback provider** when OpenRouter unavailable
- Limited model support (see `aiGateway.ts`)
- Requires `AI_GATEWAY_TOKEN` environment variable
- Automatic model mapping (see Lovable model map in `aiGateway.ts`)

## Testing

### Test Model Resolution

```typescript
// Test with default
console.log(Models.CHAT_FAST.id); // Should print default

// Test with environment override
Deno.env.set("MODEL_CHAT_FAST", "openai/gpt-4-turbo-preview");
console.log(Models.CHAT_FAST.id); // Should print "openai/gpt-4-turbo-preview"
```

### Test Capability Checks

```typescript
const visionModel = Models.VISION;
console.assert(visionModel.capabilities.supportsVision, "VISION model should support vision");

const textModel = Models.SUMMARIZATION;
console.assert(!textModel.capabilities.supportsVision, "SUMMARIZATION should not support vision");
```

## Security & Validation

### Model ID Validation

```typescript
import { validateModelId } from "../_shared/modelRegistry.ts";

if (!validateModelId(modelId)) {
  throw new Error("Invalid model ID");
}
```

### Capability Validation

```typescript
import { Models } from "../_shared/modelRegistry.ts";

const model = Models.CHAT_FAST;
if (!model.capabilities.supportsImages && imageInputProvided) {
  throw new Error("Model does not support image input");
}
```

## Troubleshooting

### Model Not Found

**Problem:** Registry lookup returns undefined

**Solution:** Check that the model is defined in `modelRegistry.ts` and `modelCapabilities.ts`

### Environment Variable Not Working

**Problem:** Environment override not taking effect

**Solution:** Ensure environment variable is set before Edge Function executes. Check variable name spelling (case-sensitive).

### Capability Mismatch

**Problem:** Model doesn't support required capability

**Solution:** Use a different registry key that supports the capability, or update the model's capabilities in `modelCapabilities.ts`

## Future Enhancements

1. **Model Fallback Chains** — Automatically fall back to cheaper models if primary fails
2. **Cost Tracking** — Track token usage and costs per model
3. **Load Balancing** — Distribute requests across multiple models for the same task
4. **A/B Testing** — Compare model performance on specific tasks
5. **Model Versioning** — Support multiple versions of the same model
6. **Regional Routing** — Route to regional model endpoints for latency optimization

## Related Documentation

- [AI Systems Audit Plan](./BIZOS_AI_SYSTEMS_AUDIT_PLAN.md)
- [Model Routing Audit](./MODEL_ROUTING_AUDIT_V1.md)
- [AI Gateway](../supabase/functions/_shared/aiGateway.ts)

## License

This documentation is part of the Exire Systema project. See project root for license information.
