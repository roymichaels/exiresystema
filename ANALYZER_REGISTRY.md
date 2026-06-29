# Analyzer Registry

## Overview
This registry documents all available analyzer agents in the Exire AI Development pipeline. Analyzers are specialized agents that inspect, analyze, and classify issues before any code modifications are made.

## Analyzer Agents

### 1. Repo Cartographer
**Purpose**: Map the Exire repository and explain structure
**Role**: Read-only navigation and mapping specialist

**Reading Capabilities**:
- Repository file tree analysis
- Directory structure mapping
- Framework identification
- Technology stack detection

**Reporting Focus**:
- App framework (React/TypeScript/Vite)
- Routing structure (client-side routing setup)
- Admin shell structure (authentication-protected admin routes)
- i18n structure (language file organization)
- Supabase boundaries (database integration points)
- Major sensitive areas (auth, payment, user data)
- Automation scripts (existing dev repair loops)

**Output**: Repository structure analysis with security and architectural considerations

### 2. Dev Health Analyzer  
**Purpose**: Run safe health checks and report system status
**Role**: System health monitoring and validation specialist

**Allowed Commands**:
- `git status --short` (read-only)
- Bun dev server start with controlled logging
- `bun run build` (if available)
- `bun run typecheck` (if available) 
- `bun run lint` (if available)

**Safety Rules**:
- Read-only by default
- Requires explicit authorization to fix issues
- Controlled environment access only

**Reporting Focus**:
- Boot status (can dev server start?)
- Build status (compiles successfully?)
- Typecheck status (typing correct?)
- Lint status (code quality good?)
- First actionable error (entry point for fixes)

**Output**: System health dashboard with actionable error identification

### 3. Vite Overlay Analyzer
**Purpose**: Detect browser/Vite overlay errors that curl alone misses
**Role**: Browser compilation error detection specialist

**Detection Focus**:
- `[plugin:vite:` (Vite plugin errors)
- `plugin:vite:import-analysis` (import resolution errors)
- `Failed to resolve import` (module resolution failures)
- `Does the file exist?` (missing file errors)
- `Pre-transform error` (Vite transformation errors)
- `Internal server error` (server-side compilation errors)
- `Cannot find module` (module not found errors)
- `Module not found` (alternative module error format)
- `Failed to load url` (asset loading errors)
- `ENOENT` (file not found errors)
- `Could not resolve` (resolution failures)
- `Rollup failed to resolve import` (rollup-level import errors)

**Safety Rules**:
- Read-only only
- No code modifications
- Browser-level verification required

**Output**: Full actionable error block with context and stack traces

### 4. Import/Module Analyzer
**Purpose**: Analyze missing local imports and module resolution issues
**Role**: Module resolution and file dependency specialist

**Read-Only Workflow**:
1. Parse failed import path from error logs
2. Identify importer file context
3. Map @/ imports to src/ directory structure
4. Check .ts/.tsx/.js/.jsx/index file candidates
5. Check git status for deleted files
6. Search for similar modules in same directory
7. Recommend restore vs update vs stop action

**Safety Boundaries**:
- No code creation
- No stub generation
- No broad refactors
- Git restore only for clearly deleted files
- Import updates only for clear single candidates

**Output**: Recommended action plan (restore deleted file vs update import vs stop and investigate)

### 5. I18n Analyzer
**Purpose**: Analyze translation/i18n health without modifying translations
**Role**: Internationalization compliance and validation specialist

**Read-Only Inspection**:
- Locale file structure and organization
- Language key completeness
- Missing translation keys
- Hardcoded Hebrew in non-Hebrew UI components
- Invalid imports/exports in i18n files
- Unsafe fallback logic detection

**Safety Rules**:
- No translation file generation
- No Spanish modification (explicit requirement)
- No UI layout changes
- No i18n file creation or deletion

**Output**: Translation health assessment with identified risks and recommendations

### 6. UI Responsive Analyzer
**Purpose**: Analyze UI layout problems without editing
**Role**: Visual layout and user experience assessment specialist

**Analysis Focus**:
- Admin shell structure and layout
- Mobile header responsive behavior
- Bottom navigation accessibility
- Desktop spacing and alignment
- Advisor panel integration
- Touch target sizes
- Duplicated navigation elements

**Output Requirements**:
- Layout observations and issues
- Screenshots/QA notes if available
- Small, focused tickets for manual review

**Safety Rules**:
- No UI modifications
- No layout changes
- Read-only analysis only

### 7. Diff Risk Reviewer
**Purpose**: Review current git diff and classify risk level
**Role**: Change impact and risk assessment specialist

**Read-Only Analysis**:
- Parse git status --short results
- Analyze git diff --stat changes
- Detect deleted files and their impact
- Identify modifications outside expected scope
- Flag changes to vite.config, tsconfig, package.json, src/i18n, Supabase, auth, Edge Functions
- Assess whether changes are safe to commit
- Determine what should be reverted
- Identify manual review requirements

**Risk Classification**:
- SAFE: Minor, focused changes within scope
- REVIEW: Changes require manual verification
- STOP: Unsafe changes requiring revert

### 8. Security Boundary Analyzer
**Purpose**: Analyze security-sensitive boundaries and potential exposures
**Role**: Security assessment and boundary validation specialist

**Read-Only Security Checks**:
- Secrets exposure (API keys, tokens, credentials)
- Supabase service role exposure
- Auth/session management changes
- RLS (Row Level Security) assumptions
- Edge Functions vulnerabilities
- OpenRouter key exposure
- Client/server boundary mistakes

**Output**: Security risk assessment and recommendations

### 9. Ticket Factory
**Purpose**: Turn analyzer reports into structured, safe tickets
**Role**: Ticket creation and workflow coordination specialist

**Ticket Requirements**:
- Unique ticket ID
- Branch name for isolated development
- Clear, concise goal statement
- Complete context for the issue
- Files likely involved (positive and negative)
- Files not to touch (explicit protections)
- Risk level classification
- Acceptance criteria
- OpenCode prompt with safety instructions
- Verification checklist
- Manual QA checklist

**Safety Features**:
- All tickets include explicit scope limitations
- Include safety rules and guidelines
- Require manual validation for critical changes
- Dean approval required for all commits