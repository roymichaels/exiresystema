# AI Failure Log

## Lessons Learned from Previous Attempts

### Critical Failures

#### 1. Translation Repair Safety Issue
- **Incident**: Hermes modified translation files without proper validation
- **Cause**: Analyzer agent exceeded read-only scope
- **Impact**: Application displayed incorrect text in multiple languages
- **Root Cause**: Insufficient safety validation for i18n modifications
- **Resolution**: Added explicit i18n safety boundaries

#### 2. Alias Resolution Error
- **Incident**: Generated incorrect path aliases during module resolution
- **Cause**: Import mapping logic incorrectly handled @/ imports
- **Impact**: Multiple module loading failures
- **Root Cause**: Inadequate @/ to src/ path conversion
- **Resolution**: Enhanced safe_update_import function with proper path mapping

#### 3. Dev Loop Success Criteria Issue
- **Incident**: Old dev repair loop treated curl success as application success
- **Cause**: Browser overlay errors missed during validation
- **Impact**: Application continued to fail despite "success" reports
- **Root Cause**: Missing browser transform verification
- **Resolution**: Added page request, wait, and Vite overlay scanning

#### 4. Deleted File Handling
- **Incident**: LeadsCRM.tsx deletion caused Vite overlay error
- **Cause**: Import expected file that was deleted from git
- **Impact**: Application failed to load CoachLeadsTab component
- **Root Cause**: Proper git restore and import recovery logic needed
- **Resolution**: Enhanced safe_restore_deleted_file function

#### 5. Path Quoting Issues
- **Incident**: Scripts failed due to repository path with spaces
- **Cause**: Paths not properly quoted in shell commands
- **Impact**: Script execution failures
- **Root Cause**: Inadequate shell escaping
- **Resolution**: All scripts now quote repository paths

#### 6. Model Policy Violations
- **Incident**: Unexpected use of Nemotron model
- **Cause**: Model not following established policy
- **Impact**: Inconsistent behavior and performance
- **Root Cause**: Model selection not following established rules
- **Resolution**: Explicit no-Nemotron policy

### Safety Improvements Implemented

1. **Enhanced Error Classification**
   - Improved error classification for unsafe patterns
   - Better risk assessment for code modifications

2. **Stricter Safety Boundaries**
   - Explicit read-only restrictions for analyzers
   - Clear fixer scope limitations
   - Enhanced Supabase/auth/Edge Function protections

3. **Browser-Level Validation**
   - Page request to trigger Vite transforms
   - Comprehensive Vite overlay error detection
   - Browser state verification

4. **Import/Module Resolution Improvements**
   - Smart git restore for deleted files
   - Enhanced import path mapping
   - Safe candidate file detection

5. **Documentation and Governance**
   - Comprehensive AGENTS.md guidelines
   - HERMES_PIPELINE.md workflow documentation
   - AI_MODEL_POLICY.md clear model rules

### Technical Improvements

1. **Error Extraction Enhancement**
   - Full error block extraction instead of first line
   - Improved Vite-specific error handling
   - Better context preservation

2. **File Restoration Logic**
   - Git restore for deleted files
   - Smart import path updates
   - Proper git status checking

3. **Safety Validation**
   - Enhanced risk classification
   - Better boundary enforcement
   - Stricter scope controls

### Key Takeaways

1. **Navigator First**: Always analyze before acting
2. **Safety First**: Read-only by default
3. **One Scope at a Time**: No broad refactors
4. **Manual Validation**: Critical changes require manual verification
5. **Browser Reality**: Curl success ≠ working application
6. **Rollback Ready**: Git is primary rollback mechanism

### Ongoing Monitoring

- Continuous improvement of analyzer registry
- Regular policy review and updates
- Enhanced safety boundary enforcement
- Performance optimization for repair loops