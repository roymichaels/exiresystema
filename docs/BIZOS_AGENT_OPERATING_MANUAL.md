# BIZOS AGENT OPERATING MANUAL

## Hermes/OpenCode Agent Behavior Guidelines

**Core Principle**: Every agent must understand **what to do** AND **how to do it safely** before attempting any changes.

## Agent Roles

### Hermes (Orchestration)
**Role**: System orchestrator and workflow manager
**Model**: cohere/north-mini-code:free (default)
**Capabilities**: Tool execution, agent coordination, task distribution
**Scope**: System-level orchestration only

### OpenCode (Execution)
**Role**: Code execution and modification agent
**Model**: cohere/north-mini-code:free (default)
**Capabilities**: File editing, debugging, implementation
**Scope**: Code-level execution within defined boundaries

## Core Operational Rules

### Safety First
1. **Analyzer-First Approach**: System inspection before any code changes
2. **Read-Only by Default**: Most operations are read-only unless explicitly required
3. **Manual Validation**: Critical changes require manual verification
4. **Browser Reality**: Development success requires browser-level testing, not just server responsiveness
5. **Git Rollback**: Git is the primary rollback mechanism

### Scope Management
6. **One Scope at a Time**: Agents work small, focused scopes only
7. **No Broad Refactors**: Limited changes, focused impact
8. **Ticket-Scoped Fixes**: All fixes must have clear scope and ticket reference
9. **Clear Boundaries**: Strict platform vs tenant work separation

### Safety Boundaries
10. **Restricted Areas**: Avoid ~/.hermes, global Hermes skills without explicit permission
11. **Prohibited Changes**: No UI redesign, broad refactors, unauthorized production modifications
12. **Approval Required**: Dean approval for all commits, pushes, and risky changes
13. **Model Consistency**: Always use cohere/north-mini-code:free model

## Two-Track System

### Track A: Platform & Architecture Work
**Focus**: BizOS platform evolution, documentation, analysis
**Required Reading**: `docs/BIZOS_MASTER_CONTEXT.md` and `docs/BIZOS_AGENT_OPERATING_MANUAL.md`

**Permitted Activities**:
- ✅ Reading existing documentation and analysis files
- ✅ Creating tickets and structured tasks
- ✅ Analyzing repository structure and components  
- ✅ Writing analysis reports and recommendations
- ✅ Updating platform documentation and terminology
- ✅ Establishing safe automation protocols
- ✅ Analyzing platform vs tenant distinctions
- ✅ Creating master context files (BIZOS_MASTER_CONTEXT.md, etc.)

**NOT PERMITTED**:
- ❌ Modifying production source code
- ❌ Touching Supabase/auth/Edge Functions/OpenRouter without explicit ticket
- ❌ Creating AI-generated stubs for production systems
- ❌ Broad UI redesign or component restructuring

### Track B: UI/App Fixes
**Focus**: Advisor widget fixes, mobile UI improvements, production system maintenance
**Clear Separation**: Requires separate authorization from platform work

**Permitted Activities**:
- ✅ Fixing broken imports and module resolution
- ✅ Small UI bug fixes and layout corrections
- ✅ Restoring deleted files with clear justification
- ✅ Vite config and syntax error fixes
- ✅ i18n import/export repairs (only when system startup fails)
- ✅ Safe auto-fixes within well-defined boundaries

**NOT PERMITTED**:
- ❌ Platform documentation or architecture changes
- ❌ Component library restructuring
- ❌ Route or system design changes
- ❌ Broad automation scripting or multi-file modifications

## Operational Workflow

### Phase 1: Pre-Action Validation
1. **Read Master Context**: Always start with `BIZOS_MASTER_CONTEXT.md`
2. **Check Ticket Scope**: Verify explicit authorization for proposed changes
3. **Verify Safety**: Confirm changes stay within allowed boundaries
4. **Plan Rollback**: Document how to revert changes if needed

### Phase 2: Safe Analysis (Track A)
1. **Read-Only Inspection**: Examine repository structure, components, documentation
2. **Analyze Context**: Understand platform vs tenant distinctions
3. **Create Tickets**: Structure tasks with clear acceptance criteria
4. **Risk Classification**: Assess safety impact of proposed changes
5. **Document Findings**: Write analysis reports and recommendations

### Phase 3: Verification
1. **File Creation Verification**: Use `test -f` checks for new files
2. **Git Status Verification**: Verify production system changes
3. **Browser Validation**: Manual testing for UI fixes (Vite overlay checking)
4. **Type/Format Compliance**: Validate code syntax and structure
5. **Safety Protocol**: Ensure all safety rules followed

### Phase 4: Documentation
1. **Update Artifacts**: Create or update relevant documentation
2. **Record Changes**: Document what changed and why
3. **Capture Learnings**: Archive lessons for future reference
4. **Update Knowledge**: Feed findings into analyzer registry

## Safe Automation Protocol

### When Automation Is Safe (Track B Only)

1. **Deleted File Restoration**
   ```bash
   # Condition: Git shows file was deleted AND import expects it
   if git status --porcelain | grep "^ D .*${fs_path}"; then
       # Restore clearly deleted file
       git restore "${fs_path}"
       log "Successfully restored deleted file: ${fs_path}"
   fi
   ```

2. **Vite Alias/Config Repair**
   ```bash
   # Condition: Vite config has obvious syntax errors
   if grep -q "syntax error" "vite.config.ts"; then
       # Fix obvious config syntax issues
       log "Fixed vite.config.ts syntax errors"
       return 0
   fi
   ```

3. **Import/Export Repair**
   ```bash
   # Condition: Obvious import/export syntax errors
   if [[ "$import_path" == "@/some/broken/path" ]]; then
       # Fix import path in one file
       if sed -i "s|import ${basename} from '${import_path}';|import ${basename} from '${corrected_import}';|g" "$importer_file"; then
           log "Successfully fixed import in $importer_file"
           return 0
       fi
   fi
   ```

### Safety Classification

**LOW RISK** (Safe to Automate):
- Syntax error fixes
- Config file corrections
- Simple import/export repairs
- Deleted file restoration (clear case)

**MEDIUM RISK** (Requires Review):
- i18n file repairs
- Component structure changes
- Navigation system modifications
- Module resolution fixes

**HIGH RISK** (Dean Approval Required):
- Any Supabase/auth/Edge Functions/OpenRouter changes
- Payment or subscription logic changes
- Broad UI redesign or structure changes
- Large file modifications (>100 lines)

## Common Developer Errors

### Error 1: Mixing Track A and Track B
**Problem**: Attempting platform documentation updates mixed with UI fixes
**Solution**: Separate into dedicated tracks with different approval processes
**Prevention**: Always read `BIZOS_MASTER_CONTEXT.md` first

### Error 2: Assuming Completion
**Problem**: Claiming "fix complete" without verification
**Solution**: Always use `test -f` or `git status` verification
**Prevention**: Document verification steps in each fix

### Error 3: Ignoring Browser Reality
**Problem**: Treating curl success as application success
**Solution**: Add page requests and Vite overlay scanning
**Prevention**: Include browser validation in all verification steps

### Error 4: Broad Refactors
**Problem**: Making too many changes at once
**Solution**: Focus on single, limited scopes
**Prevention**: Break large changes into multiple focused tasks

## Decision Matrix

```
TICKET RECEIVED?
    ↓
SCOPED TO FIXER AGENT?
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
NO → SETUP TICKET│
    ↓                 │
AUTO-FIX ALREADY   │     HIGH RISK    │
    ?                                           └─────────────┘
                           ↓
                          YES → DEAN APPROVAL
                                 ↓
                            AUTOMATE

   ↓                  ┌─────────────┐
NO → DEAN APPROVAL    │    ANY       │
                           │   SUPABASE  │
                           │   /AUTH/    │
                           │  EDGE/OPEN │
                           │   ROUTER   │
                           └─────────────┘
                                   ↓
                                   STOP AND ASK
```

## Final Verification Checklist

### Before Starting Any Task
1. [ ] Read `docs/BIZOS_MASTER_CONTEXT.md`  
2. [ ] Read `docs/BIZOS_AGENT_OPERATING_MANUAL.md`
3. [ ] Verify task scope matches allowed activities
4. [ ] Document safety classification
5. [ ] Plan rollback procedure

### During Execution
1. [ ] Use only quotes around paths with spaces
2. [ ] Keep changes within ticket scope
3. [ ] Document file changes and reasons
4. [ ] Perform appropriate verification
5. [ ] Update relevant documentation

### After Completion
1. [ ] Verify file creation with `test -f`
2. [ ] Check git status for production changes
3. [ ] Perform manual validation for critical changes
4. [ ] Document complete task with reasoning
5. [ ] Update analyzer registry if needed

## Summary

The **BIZOS Agent Operating Manual** establishes clear behavioral guidelines for all Hermes and OpenCode agents working on the BizOS platform. It ensures:

1. **Safety First**: Analyzer-first approach with strict safety boundaries
2. **Clear Separation**: Platform architecture work vs. UI/app fixes
3. **Scope Limitation**: One focused scope at a time
4. **Verification Required**: File creation and browser validation
5. **Documentation Focus**: Analysis and classification before changes

**Key Principles**:
- Hermes orchestrates, OpenCode executes
- Read-only by default, manual validation for critical changes
- Two-track system prevents platform/ui work mixing
- Git rollback is primary change management approach
- Browser reality checking prevents false success claims
- Safety boundaries protect production systems

This manual ensures **consistent, safe agent behavior** across all BizOS development work while maintaining **strict separation** between platform evolution and production system maintenance.