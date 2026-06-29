# AI Model Policy

## Core Principles

### Default Models
- **Hermes (Orchestration)**: cohere/north-mini-code:free
- **OpenCode (Execution)**: cohere/north-mini-code:free

### Model Selection Rules
1. **Fixed Model IDs Preferred**: Always prefer specific model identifiers over random router fallbacks
2. **Stable Over Random**: Use consistent model IDs for reliable behavior
3. **Fast/Stable vs Huge/Slow**: For repair loops and immediate fixes, prioritize fast and stable models
4. **No Nemotron**: Never use Nemotron as default model for Exire development
5. **Large Models as Fallback**: Big models reserved for complex analysis when small models are insufficient

### Model Classification

#### Primary Models (Default)
- **cohere/north-mini-code:free**: Primary model for both Hermes and OpenCode
- **Characteristics**: Fast, stable, good for coding and analysis
- **Use Cases**: Daily development, code fixes, routine analysis

#### Fallback Models (Specialized Tasks)
- **Large models**: Complex reasoning, architectural decisions
- **Domain-specific models**: Research, specialized analysis
- **Only used when**: Primary model insufficient or task specifically requires advanced capabilities

### Model Usage Guidelines

1. **Exire Development**: Stick to primary model unless Dean explicitly authorizes change
2. **Repair Loops**: Prioritize fast, stable models for quick fixes
3. **Analysis Tasks**: Use appropriate model based on task complexity
4. **Safety First**: Never experiment with model combinations without Dean approval

### Model Documentation

Each model usage should be documented with:
- Purpose of model selection
- Task complexity justification
- Expected outcomes
- Safety considerations

### Emergency Model Changes

In emergency situations where Dean approves model changes:
- Document the emergency justification
- Use highest necessary model capability
- Revert to default as soon as possible
- Submit change request to Dean