# BIZOS ARCHITECTURE GUARDRAILS

## Protected System Boundaries

### Critical Systems (DO NOT TOUCH Without Dean Approval)

#### Infrastructure Systems
- **Supabase Database Schema**: All database structure, tables, relationships, and RLS policies
- **Authentication Systems**: Auth contexts, session management, Web3Auth integration
- **Edge Functions**: All serverless function implementations and configurations
- **OpenRouter Gateway**: AI model integration, API routing, authentication
- **Payment Processing**: All financial systems, subscriptions, billing
- **Production Business Logic**: Core application functionality, business rules

#### Security & Access Control
- **Row-Level Security (RLS)**: Database access policies and permissions
- **Role-Based Access Control**: User role management and authorization
- **Session Management**: Authentication state and persistence
- **Rate Limiting**: API access controls and throttling

#### System Integration
- **External API Integrations**: Third-party service connections (OpenRouter, etc.)
- **Configuration Management**: Environment variables and system settings
- **Monitoring & Logging**: Performance metrics and audit trails
- **Deployment Infrastructure**: CI/CD pipelines and production deployment

### Analysis-Only Safe Areas

#### Documentation & Analysis
- **docs/BIZOS_*.md**: All BizOS documentation files
- **Component Inventories**: Module maps, feature matrices, route inventories
- **Architecture Documentation**: Technical design and specifications
- **Planning Documents**: Roadmaps, tickets, analysis reports
- **Analyzers Registry**: Analysis tools and methodologies

#### Research & Investigation
- **File Structure Analysis**: Repository mapping and component classification
- **Security Reviews**: Static analysis without modifications
- **Performance Metrics**: System health and dependency analysis
- **Requirements Documentation**: Business and technical specifications

### Safe Code Modifications (Well-Scoped)

#### Minimal, Focused Changes
1. **Deleted File Restoration**
   - Condition: Clearly deleted import, git shows deletion
   - Action: `git restore "path/to/file"`
   - Verification: Import resolution success
   - Example: LeadsCRM.tsx deleted, CoachLeadsTab.tsx depends on it

2. **Vite Configuration Syntax Fixes**
   - Condition: Obvious syntax errors preventing server startup
   - Action: Fix syntax in vite.config.ts, package.json, etc.
   - Verification: Vite dev server starts successfully
   - Example: Missing quotes, invalid syntax in config files

3. **Import/Export Resolution**
   - Condition: Broken import statements causing module resolution failures
   - Action: Fix single broken import path in one file
   - Verification: Import resolution succeeds
   - Example: `@/components/LeadCard` → `@/components/LeadCard.tsx`

4. **Component Creation**
   - Condition: Missing required component for system functionality
   - Action: Create minimal, non-production component to resolve critical error
   - Verification: Application startup and basic functionality
   - Example: Temporary error boundary for critical missing error handler

5. **Internationalization (i18n) Repair**
   - Condition: i18n imports/exports causing startup failure
   - Action: Fix import/export syntax in i18n configuration
   - Verification: i18n system loads correctly without translation errors
   - Example: Missing default export in i18n/index.ts

### High-Risk Operations (Require Dean Approval)

#### System Changes
- **Database Schema Modifications**
- **Authentication Logic Changes**
- **Edge Function Creation/Modification**
- **Network Configuration Changes**
- **Security Policy Modifications**

#### Application Changes
- **Large Refactoring Projects** (> 100 lines modified)
- **Multiple File Dependencies** (affecting many components)
- **Core Architecture Overhaul**
- **Feature Complete Removal**
- **Broad UI Redesign**

#### Operational Changes
- **Production Deployment**
- **Environment Configuration**
- **Access Control Modifications**
- **Performance Optimization**
- **Monitoring System Changes**

### Safe Development Environment

#### Read-Only Access Areas
- **Repository Analysis**: `git status --short`, `git diff --stat`
- **Documentation Files**: All .md, .txt, .json files in docs/
- **Analysis Tools**: Scripts, analyzers, testing utilities
- **Configuration Files**: vite.config.ts, package.json, .env files

#### Verification Procedures
1. **File System Verification**
   - Confirm file creation with `test -f filename`
   - Validate file permissions and structure
   - Check for unexpected file deletions

2. **Git Operations Verification**
   - Verify changes with `git status --short`
   - Review diffs with `git diff --stat`
   - Confirm rollback capabilities

3. **Application Validation**
   - Vite dev server startup verification
   - Basic functionality testing
   - Error overlay detection and resolution
   - Component import verification

#### Development Workflow Restrictions

1. **Scope Limitation**
   ```
   Safe Path: Limited file edits with clear justification
   Unsafe Path: Multiple file dependencies, cross-component changes
   ```

2. **Safety Classification**
   ```
   LOW RISK: Syntax fixes, config corrections, deleted file restoration
   MEDIUM RISK: Import repairs, basic validation, localized changes
   HIGH RISK: System changes, production modifications, Dean approval required
   ```

3. **Automation Safety Protocol**
   ```bash
   # Automated fix template (LOW RISK only)
   if [[ "$type" == "syntax_fix" ]]; then
       # Safe syntax correction
       sed -i "s/broken/safe/g" "file.ts"
       log "Fixed syntax error"
   elif [[ "$type" == "deleted_file" ]]; then
       # Safe file restoration
       git restore "$path"
       log "Restored deleted file: $path"
   fi
   ```

### Security & Compliance

#### Access Controls
- **Permission Verification**: Ensure read-only access for analyzers
- **Path Protection**: Quote all repository paths with spaces
- **Scope Enforcement**: Maintain strict task boundaries
- **Audit Trail**: Document all automation attempts

#### Error Handling
- **Graceful Degradation**: Handle parsing failures safely
- **Error Context Preservation**: Maintain full error block information
- **Rollback Capability**: Ensure changes can be reversed
- **Safety Logging**: Document all automated actions

### Decision Matrix

```
REQUESTED OPERATION?
    ↓
TICKET SCOPE?
    ↓
LOW RISK (syntax, config)?
    ↓                    ┌─────────────┐
    YES → AUTOMATE     │    MEDIUM   │
    ↓                 │   RISK (import │
    NO  → MANUAL     │   repairs)?   │
                           ↓
                         YES → AUTOMATE
                                          ┌─────────────┐
    ↓                 │    HIGH RISK    │
NO → DEAN APPROVAL│
    ↓                 │
ALREADY AUTO-FIX?   │     RESTRICTED  │
    ?                                           └─────────────┘
                           ↓
                          YES → STOP AND ASK

      ↓                  ┌─────────────┐
NO → DEAN APPROVAL    │    ANY       │
                           │   SYSTEM    │
                           │   CHANGE    │
                           └─────────────┘
                                   ↓
                                   MANUAL OR STOP
```

### Emergency Override Procedures

#### Critical Situations
1. **System Crash**: Application completely non-functional
2. **Security Breach**: Compromised system or data
3. **Data Loss Risk**: Preventing critical data corruption
4. **Compliance Violation**: Risk of regulatory non-compliance

#### Override Protocol
1. **Immediate Action**: Critical fix to prevent damage
2. **Documentation**: Detailed record of emergency action
3. **Reporting**: Immediate escalation to Dean
4. **Follow-up**: Post-emergency analysis and improvement

### Safe Development Environment Setup

#### Environment Variables
```bash
# Safe development environment
export PATH="/proper/path/with/quotes/$PATH"
export REPO_ROOT="/home/roymichaels/Desktop/AI Management/exire"
cd "$REPO_ROOT"
```

#### Verification Commands
```bash
# File existence verification
test -f "docs/BIZOS_MASTER_CONTEXT.md" && echo "File exists"

# Git status verification  
git status --short

# Application startup verification
curl -s "http://localhost:3000" && echo "Application running"

# Syntax validation
bun run build 2>&1 | grep -q "error:" || echo "Build successful"
```

### Summary

**BIZOS Architecture Guardrails** establishes clear boundaries between safe analysis/development and restricted production system modifications. It ensures:

1. **System Protection**: Critical infrastructure remains protected
2. **Safe Analysis**: Documentation and analysis without modifications
3. **Minimal Fixes**: Limited, well-scoped changes only
4. **Verification Required**: File system, git, and application validation
5. **Dean Approval**: High-risk changes require explicit authorization

The guardrails maintain the **analyzer-first** development approach while protecting **production systems** from unintended changes or unauthorized modifications.

**Key Principles**:
- System protection > Unrestricted access
- Read-only analysis > Production modifications
- Clearly defined safety boundaries > ambiguity
- Dean approval > autonomous high-risk changes
- Documented procedures > undocumented automation