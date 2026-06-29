# Exire AI Development Base Layer
# Exire AI Development Base Layer
## Agent Guidelines

**Exire is an existing production application, not a prototype.** This is a well-established application with active users and business logic. Treat every change as impacting live systems.

### Important: Platform Context

**Before starting any task, read:**
- `docs/BIZOS_MASTER_CONTEXT.md` - Complete platform operating context
- `docs/BIZOS_AGENT_OPERATING_MANUAL.md` - Agent behavior and safety protocols

This ensures all Hermes and OpenCode agents operate within the **BizOS operating context** with full understanding of:
- Platform vs tenant distinctions
- Current repository reality
- Safety boundaries and restrictions
- Strategic priorities and requirements

### Hermes (Orchestration)
- **Role**: System orchestrator and workflow manager
- **Capabilities**: Tool execution, agent coordination, task distribution
- **Model**: cohere/north-mini-code:free (default)
- **Scope**: System-level orchestration only

### OpenCode (Execution)
- **Role**: Code execution and modification agent
- **Capabilities**: File editing, debugging, implementation
- **Model**: cohere/north-mini-code:free (default)
- **Scope**: Code-level execution within defined boundaries

### Core Infrastructure
- **Bun/Vite**: Build and development verification layer
- **Git**: Version control and rollback layer
- **Repository**: /home/roymichaels/Desktop/AI Management/exire (quoted due to spaces)

### Governance
- **Dean**: Approves all commits, pushes, merges, and risky changes
- **Safety First**: Never touch ~/.hermes or global Hermes skills while fixing Exire
- **Browser Reality**: Never treat curl success as proof the app works - Vite overlay errors count as failures

### Working Principles
- **One Scope at a Time**: Agents work small, focused scopes only
- **Read-Only by Default**: Most operations are read-only unless explicitly required
- **Manual Validation**: Critical changes require manual verification
- **Model Policy**: Fixed cohere/north-mini-code:free preferred over random free router
- **Fast/Stable Over Huge/Slow**: Quick, reliable fixes preferred for repair loops

### Safety Rules
- Never touch Supabase/auth/Edge Functions/OpenRouter unless explicitly required
- Never redesign UI
- Never modify production behavior without explicit request
- Never run broad refactors
- Always quote paths due to repository path containing spaces
- Never use Nemotron model - use cohere/north-mini-code:free

## BizOS Platform Context

### Platform vs Tenant Distinction
- **BizOS**: AI Business Operating System platform for all businesses
- **Exire Systema**: First and current live tenant within BizOS (Dean\'s own business)
- **Platform**: Generic infrastructure, shared services, business primitives
- **Tenant**: Business-specific implementations within the platform

### Development Environment
- **Repository Location**: /home/roymichaels/Desktop/AI Management/exire (note spaces in path)
- **Primary Agent Model**: cohere/north-mini-code:free (standard for all Hermes and OpenCode operations)
- **Development Workflow**: Analyzer-first, fixer-second approach for system analysis before changes
- **Safety Priority**: Read-only operations by default, manual validation required for critical changes
- **Version Control**: Git-based rollback primary mechanism for all modifications

### Key Operational Guidelines
- **Path Handling**: All repository paths must be quoted due to spaces in directory structure
- **Scope Management**: Agents work within strictly defined, limited scopes to prevent unintended impacts
- **Validation Requirements**: Critical changes require manual verification beyond automated testing
- **Browser Reality**: Development success requires browser-level testing, not just server responsiveness
- **Model Consistency**: Cohesive/north-mini-code:free model maintained across all agent operations

### Safety Boundaries
- **Restricted Areas**: ~/.hermes, global Hermes skills, production Supabase/auth configurations
- **Prohibited Changes**: UI redesign, broad refactors, unauthorized production modifications
- **Approval Requirements**: Dean approval needed for all commits, pushes, and high-risk changes
- **Emergency Protocols**: Clearly defined escalation paths for critical system issues