# Safe Automation Rules

## Overview
These rules define when automation is safe to execute and when manual review is required. All automation must follow the analyzer-first, fixer-second approach.

## Safe Auto-Fix Operations

### Allowed Auto-Fix Operations
1. **Deleted File Restoration**
   - Condition: Git clearly shows file was deleted AND import expects it
   - Action: `git restore "path/to/file"`
   - Verification: File should exist and resolve the import
   - Example: LeadsCRM.tsx was deleted, CoachLeadsTab.tsx imports it

2. **Vite Alias/Config Repair**
   - Condition: Vite configuration contains obvious errors preventing startup
   - Action: Fix obvious config syntax or path errors
   - Verification: Vite dev server starts successfully
   - Example: vite.config.ts has syntax error in resolver configuration

3. **Import/Export Repair**
   - Condition: Obvious import/export syntax errors
   - Action: Fix broken import statements, export syntax
   - Verification: Import resolution succeeds
   - Example: Missing default export keyword, circular import resolution

4. **Syntax Error Repair**
   - Condition: Obvious syntax errors in code files
   - Action: Fix syntax, complete incomplete statements
   - Verification: Code compiles without syntax errors
   - decoration, missing semicolons

5. **i18n Import/Export Crash Repair**
   - Condition: i18n imports/exports causing application startup failure
   - Action: Fix i18n file import/export syntax
   - Verification: i18n system loads correctly
   - decoration, and incomplete if blocks

### Stop and Ask Dean for:

1. **Supabase/auth/RLS/Schema Changes**
   - Any modification to database schema or RLS policies
   - Authentication logic changes
   - User permission modifications

2. **Edge Functions**
   - Creation or modification of Edge Functions
   - Trigger or webhook configuration
   - Serverless function deployment

3. **OpenRouter Gateway**
   - Changes to API gateway configuration
   - Authentication or routing logic
   - Rate limiting or access control modifications

4. **Payment/Subscription Logic**
   - Any billing or subscription system changes
   - Payment processing modifications
   - Revenue calculation logic

5. **Broad UI Redesign**
   - Layout structure changes
   - Component architecture refactoring
   - Navigation system overhauls

6. **Deleting Features**
   - Any user-facing feature removal
   - Backend API endpoint deletion
   - Database table removal

7. **Creating Fake Stubs**
   - Generating placeholder components for critical missing modules
   - Mock implementations for real functionality
   - Dummy data structures for production use

8. **Architecture Refactors**
   - Framework or technology stack changes
   - Structural redesign of core systems
   - Major version upgrades

9. **Large Diffs**
   - Changes exceeding 100 lines modified
   - Multiple file interactions
   - Cross-component architectural changes

## Automation Safety Protocol

### Pre-Execution Checks
1. **Scope Verification**
   - Confirm changes are within ticket scope
   - Verify no files outside defined boundaries
   - Check for required approvals

2. **Safety Classification**
   - Low Risk: Simple syntax fixes, config corrections
   - Medium Risk: Import/export repairs, basic validations
   - High Risk: Module restructuring, i18n handling
   - Critical Risk: Any Supabase/auth/OpenRouter changes

3. **Verification Plan**
   - Define expected outcomes
   - Specify verification commands
   - Set rollback procedures

### Execution Rules
1. **Quote All Paths**: Repository paths contain spaces, always quote
2. **One Scope at a Time**: No broad refactors or multiple file changes
3. **Manual Validation**: Critical changes require manual verification
4. **Browser Reality**: Curl success ≠ working application (Vite overlay errors count as failures)
5. **Rollback Ready**: Git is primary rollback mechanism

## Decision Tree

```
TICKET RECEIVED?
    ↓
SCOPED TO FIXER AGENT?
    ↓
LOW RISK (syntax, config)?
    ↓                    ┌─────────────┐
    YES → AUTOMATE     │    MEDIUM    │
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

## Safe Fix Templates

### Template 1: Deleted File Restore
```bash
# Check if file was deleted in git
if git status --porcelain | grep "^ D .*${fs_path}"; then
    # Restore deleted file
    git restore "${fs_path}"
    log "Successfully restored deleted file: ${fs_path}"
else
    # File not deleted, try auto-import fix
    safe_update_import "${import_path}" "${importer_file}"
fi
```

### Template 2: Vite Config Repair
```bash
# Fix obvious vite.config.ts syntax errors
if grep -q "syntax error" "vite.config.ts"; then
    # Fix common vite.config syntax issues
    # ... repair logic ...
    log "Fixed vite.config.ts syntax errors"
    return 0
else
    log "No obvious vite.config.ts errors found"
    return 1
fi
```

### Template 3: Import Repair
```bash
# Fix broken import statements
if [[ "$import_path" == "@/some/broken/path" ]]; then
    # Correct import path
    corrected_import="@/correct/path"
    
    # Update importer file
    if sed -i "s|import ${basename} from '${import_path}';|import ${basename} from '${corrected_import}';|g" "$importer_file"; then
        log "Successfully fixed import in $importer_file"
        return 0
    fi
fi
```

## Monitoring and Auditing

### Required Logging
1. **Action Logs**: All automated actions must be logged
2. **Error Logs**: Failed automation attempts must be detailed
3. **Approval Logs**: All Dean approvals must be recorded
4. **Rollback Logs**: Any rollback actions must be documented

### Audit Requirements
1. **Scope Compliance**: Verify all changes stay within ticket scope
2. **Safety Boundary**: Confirm no restricted areas were modified
3. **Verification Complete**: Ensure all fixes passed verification checks
4. **Documentation**: Update relevant documentation with changes

## Emergency Override

### When to Override Safe Automation
1. **Critical System Failure**: Application completely broken
2. **Security Vulnerability**: Immediate security risk
3. **Data Loss Prevention**: Risk of data corruption or loss
4. **Compliance Violation**: Risk of regulatory non-compliance

### Emergency Override Protocol
1. **Immediate Action**: Perform necessary fix to prevent damage
2. **Document**: Detailed documentation of emergency action
3. **Report**: Immediate reporting to Dean
4. **Follow-up**: Post-emergency analysis and improvements

## Post-Execution Verification

### Required Verification Steps
1. **Build Verification**: `bun run build` (if available)
2. **TypeCheck Verification**: `bun run typecheck` (if available)
3. **Lint Verification**: `bun run lint` (if available)
4. **Browser Verification**: Manual testing for functionality
5. **Regression Testing**: Ensure no new issues introduced
6. **Documentation Update**: Update relevant documentation

### Verification Failure Protocol
1. **Rollback**: Immediately revert changes
2. **Investigation**: Identify root cause of failure
3. **Fix Attempt**: Try alternate fix approach
4. **Dean Notification**: Report verification failure
5. **Escalation**: Escalate to Dean if critical