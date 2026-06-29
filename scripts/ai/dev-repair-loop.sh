#!/bin/bash

set -euo pipefail

# Dev Server Repair Loop for Exire
# Starts a Bun dev server, monitors for errors, uses OpenCode to fix them
# PATCHED VERSION: Enhanced Vite overlay/import-analysis error detection and auto-repair

REPO_ROOT="/home/roymichaels/Desktop/AI Management/exire"
REPORTS_DIR="$REPO_ROOT/reports/ai-runs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error_exit() {
    log "ERROR: $*"
    exit 1
}

# Verify we're in the right place
if [[ ! -d "$REPO_ROOT/.git" ]]; then
    error_exit "Not inside a git repository at $REPO_ROOT"
fi

# Verify Bun exists
if ! command -v bun >/dev/null 2>&1; then
    error_exit "Bun not found. Please install Bun."
fi

# Verify OpenCode exists
if ! command -v opencode >/dev/null 2>&1; then
    error_exit "OpenCode not found. Please install OpenCode."
fi

# Ensure reports directory exists
mkdir -p "$REPORTS_DIR"

# Initialize loop variables
MAX_LOOPS=6
LOOP_COUNT=0
ERROR_COUNTS=()
TIMEOUT_SECONDS=30
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DEV_LOG="$REPORTS_DIR/dev-loop-${TIMESTAMP}.log"
OPENCODE_OUT="$REPORTS_DIR/opencode-output-${TIMESTAMP}.log"
REPAIR_PROMPT="$REPORTS_DIR/repair-prompt-${TIMESTAMP}.md"

# Change to repo root
cd "$REPO_ROOT" || error_exit "Cannot change to repo root $REPO_ROOT"

# Simple error classification
classify_error() {
    local error_text="${1:-}"
    
    # Check for unsafe patterns
    if echo "$error_text" | grep -qiE "(supabase|edge.function|openrouter|auth|payment|subscription|schema|rlr|redesign|architecture|rewrite|delete|huge|broad|ui)"; then
        echo "STOP_AND_REPORT"
        return
    fi
    
    # Default to safe auto fix
    echo "SAFE_AUTO_FIX"
}

# Extract error from logs - IMPROVED VERSION
extract_error() {
    local log_content="${1:-}"
    
    # Look for Vite plugin error patterns first (most specific)
    if echo "$log_content" | grep -q "\[plugin:vite:"; then
        # Extract Vite plugin error block with full context
        local vite_error_block="$(echo "$log_content" | grep -B2 -A10 "\[plugin:vite:" | head -30)"
        if [[ -n "$vite_error_block" ]]; then
            echo "$vite_error_block"
            return
        fi
    fi
    
    # Look for import-analysis errors specifically
    if echo "$log_content" | grep -q "plugin:vite:import-analysis"; then
        # Extract the full import-analysis error block
        local import_analysis_block="$(echo "$log_content" | grep -B2 -A10 "plugin:vite:import-analysis" | head -30)"
        if [[ -n "$import_analysis_block" ]]; then
            echo "$import_analysis_block"
            return
        fi
    fi
    
    # Look for "Failed to resolve import" errors
    if echo "$log_content" | grep -q "Failed to resolve import"; then
        # Extract full block around the import error
        local import_error_block="$(echo "$log_content" | grep -B3 -A10 "Failed to resolve import" | head -40)"
        if [[ -n "$import_error_block" ]]; then
            echo "$import_error_block"
            return
        fi
    fi
    
    # Look for "Does the file exist?" errors
    if echo "$log_content" | grep -q "Does the file exist?"; then
        local file_exist_block="$(echo "$log_content" | grep -B3 -A8 "Does the file exist?" | head -30)"
        if [[ -n "$file_exist_block" ]]; then
            echo "$file_exist_block"
            return
        fi
    fi
    
    # Continue with other error patterns
    if echo "$log_content" | grep -q "error:"; then
        echo "$(echo "$log_content" | grep -i "error:" | head -1)"
        return
    fi
    if echo "$log_content" | grep -q "Error:"; then
        echo "$(echo "$log_content" | grep -i "Error:" | head -1)"
        return
    fi
    if echo "$log_content" | grep -q "Failed to compile"; then
        echo "$(echo "$log_content" | grep -i "Failed to compile" | head -1)"
        return
    fi
    if echo "$log_content" | grep -q "Module not found"; then
        echo "$(echo "$log_content" | grep -i "Module not found" | head -1)"
        return
    fi
    if echo "$log_content" | grep -q "Typescript compilation failed"; then
        echo "$(echo "$log_content" | grep -i "Typescript compilation failed" | head -1)"
        return
    fi
    if echo "$log_content" | grep -q "Vite compile error"; then
        echo "$(echo "$log_content" | grep -i "Vite compile error" | head -1)"
        return
    fi
    
    echo "Unknown error occurred"
}

# Safe restore function for deleted files
safe_restore_deleted_file() {
    local import_path="$1"
    local importer_file="$2"
    
    # Convert @/ path to filesystem path
    local fs_path="${import_path#':/}'"
    if [[ "$fs_path" == "@"/* ]]; then
        fs_path="${fs_path#'/}'"  # Remove leading slash
    fi
    
    log "Detected deleted file pattern: $import_path -> $fs_path"
    
    # Check git status for deleted file
    if git status --porcelain | grep -q "^ D .*${fs_path}"; then
        log "File $fs_path was deleted. Attempting to restore from git..."
        if git restore "$fs_path"; then
            log "Successfully restored deleted file: $fs_path"
            return 0
        else
            log "Failed to restore deleted file: $fs_path"
            return 1
        fi
    fi
    
    return 2
}

# Safe update import function for moved files
safe_update_import() {
    local import_path="$1"
    local importer_file="$2"
    
    # Convert @/ path to repo-relative path
    local import_var="${import_path#':/}'"
    if [[ "$import_var" == "@"/* ]]; then
        import_var="${import_var#'/}'"
    fi
    
    # Try to find the file in common formats
    local candidates=()
    
    # Try adding .tsx extension
    local candidate="${import_var}.tsx"
    if [[ -f "$candidate" ]]; then
        candidates+=("$candidate")
    fi
    
    # Try adding .ts extension
    local candidate="${import_var}.ts"
    if [[ -f "$candidate" ]]; then
        candidates+=("$candidate")
    fi
    
    # Check for index files
    local index_candidate="${import_var}/index.ts"
    if [[ -f "$index_candidate" ]]; then
        candidates+=("$index_candidate")
    fi
    
    local index_candidate="${import_var}/index.tsx"
    if [[ -f "$index_candidate" ]]; then
        candidates+=("$index_candidate")
    fi
    
    # Search for similar files if no direct match
    if [[ ${#candidates[@]} -eq 0 ]]; then
        log "No direct file found for $import_path. Searching for similar files..."
        
        # Find files with similar names in the same directory
        local dirname="$(dirname "$import_var")"
        local basename="$(basename "$import_var")"
        
        if [[ -d "$dirname" ]]; then
            local similar_files=()
            
            # Find files with similar basename
            while IFS= read -r file; do
                similar_files+=("$file")
            done < <(find "$dirname" -maxdepth 1 -type f \( -name "*.${basename}.*" -o -name "*${basename}.*" \) 2>/dev/null || true)
            
            # Filter for valid TypeScript files
            local filtered_files=()
            for file in "${similar_files[@]}"; do
                local name="$(basename "$file")"
                if [[ "$name" == "${basename}.*" && \( "$name" == "${basename}.tsx" || "$name" == "${basename}.ts" \) ]]; then
                    filtered_files+=("$file")
                fi
            done
            
            # Check if we found exactly one candidate
            if [[ ${#filtered_files[@]} -eq 1 ]]; then
                candidates+=("${filtered_files[0]}")
                log "Found candidate: ${filtered_files[0]}"
            fi
        fi
    fi
    
    # If we have exactly one candidate, update the import
    if [[ ${#candidates[@]} -eq 1 ]]; then
        local new_import="${candidates[0]}"
        
        # Convert to @/ format
        local relative_path="$(realpath --relative-to="${REPO_ROOT}/src" "$new_import" 2>/dev/null || echo "$new_import")"
        
        if [[ "$relative_path" == "$new_import" ]]; then
            # File is not under src, keep as relative import
            log "Updating import from $import_path to $new_import (not under src)"
        else
            local new_import_var="@/components/${relative_path}"
            log "Updating import from $import_path to @/${relative_path}"
            import_path="$new_import_var"
        fi
        
        # Update the file
        if sed -i "s|import ${basename} from '${import_path}';|import ${basename} from '${import_path}';|g" "$importer_file"; then
            log "Successfully updated import in $importer_file"
            return 0
        else
            log "Failed to update import in $importer_file"
            return 1
        fi
    fi
    
    return 2
}

log "Starting Exire dev-server repair loop"
log "Timestamp: $TIMESTAMP"
log "Reporting directory: $REPORTS_DIR"
log "Repository: $REPO_ROOT"
log "OpenCode model: cohere/north-mini-code:free"
log "Branch: exire/automation-dev-repair-loop"
log "Focus: Boot/dev-server repair only - no UI changes, no translation cleanup unless error points there"

# Main loop
while [[ $LOOP_COUNT -lt $MAX_LOOPS ]]; do
    LOOP_COUNT=$((LOOP_COUNT + 1))
    log "=== LOOP $LOOP_COUNT/$MAX_LOOPS ==="
    
    # Kill any existing dev server process
    if [[ -n "${DEV_PID:-}" ]]; then
        log "Killing previous dev server process (PID: $DEV_PID)"
        kill $DEV_PID 2>/dev/null || true
        wait $DEV_PID 2>/dev/null || true
    fi
    
    # Start dev server
    log "Starting Bun dev server..."
    bun run dev > "$DEV_LOG" 2>&1 &
    DEV_PID=$!
    
    # Wait for server to start or error
    log "Waiting up to $TIMEOUT_SECONDS seconds for server..."
    server_ready=false
    server_error=false
    elapsed_time=0
    
    while [[ $elapsed_time -lt $TIMEOUT_SECONDS ]]; do
        # Check if process is still running
        if ! kill -0 $DEV_PID 2>/dev/null; then
            log "Dev server process terminated"
            server_error=true
            break
        fi
        
        # Check for errors in the log
        if grep -q -E "(error:|Error:|vite.*error|compilation failed|build failed)" "$DEV_LOG" 2>/dev/null; then
            log "Error detected in dev server logs"
            server_error=true
            break
        fi
        
        # Check if server is responding
        if curl -s -f --max-time 2 "http://localhost:5173/" >/dev/null 2>&1; then
            server_ready=true
            break
        fi
        
        sleep 5
        elapsed_time=$((elapsed_time + 5))
    done
    
    # Check server status
    if [[ "$server_ready" == true ]]; then
        log "SUCCESS: Dev server started successfully and is ready"
        
        # AT THIS POINT, WE MUST REQUEST THE PAGE TO TRIGGER BROWSER TRANSFORMS
        log "Requesting page to trigger browser module transforms..."
        if curl -s "http://localhost:5173/" > /dev/null 2>&1; then
            log "Page requested successfully"
        else
            log "Page request failed, continuing anyway"
        fi
        
        # Wait for browser transform to complete (Vite may only show errors after page load)
        sleep 5
        
        # Now scan the log for Vite overlay errors that may have appeared after page load
        log "Scanning for Vite overlay errors after page request..."
        
        # Define Vite error patterns to detect
        VITE_ERROR_PATTERNS=(
            "\[plugin:vite:"
            "plugin:vite:import-analysis"
            "Failed to resolve import"
            "Does the file exist?"
            "Pre-transform error"
            "Internal server error"
            "Cannot find module"
            "Module not found"
            "Failed to load url"
            "ENOENT"
            "Could not resolve"
            "Rollup failed to resolve import"
        )
        
        vite_has_errors=false
        for pattern in "${VITE_ERROR_PATTERNS[@]}"; do
            if grep -q -E "$pattern" "$DEV_LOG" 2>/dev/null; then
                vite_has_errors=true
                log "Vite overlay error detected: pattern '$pattern' found in log"
                break
            fi
        done
        
        if [[ "$vite_has_errors" == true ]]; then
            log "Vite compile/overlay errors detected after page request. This counts as failure, not success."
            server_ready=false
            server_error=true
        else
            log "SUCCESS: No Vite overlay errors detected after page request. Browser compilation successful."
            break
        fi
    fi
    
    if [[ "$server_error" == true ]]; then
        log "Dev server error detected. Analyzing error..."
        
        # Extract error from logs
        error_content="$(cat "$DEV_LOG" 2>/dev/null || echo "")"
        error_info="$(extract_error "$error_content")"
        error_class="$(classify_error "$error_info")"
        
        log "Error classification: $error_class"
        log "Error details: $error_info"
        
        # Check if same error occurred twice in a row
        if [[ ${#ERROR_COUNTS[@]} -gt 1 ]] && [[ "${ERROR_COUNTS[-1]}" == "$error_info" ]] && [[ "${ERROR_COUNTS[-2]}" == "$error_info" ]]; then
            log "Same error repeated twice. Stopping and reporting."
            echo "Last error repeated twice. $error_info" >> "$DEV_LOG" 2>/dev/null || true
            break
        fi
        
        # Add to error count
        ERROR_COUNTS+=("$error_info")
        
        # Check for Vite import-analysis missing module patterns
        if echo "$error_info" | grep -q "plugin:vite:import-analysis" && echo "$error_info" | grep -q "Failed to resolve import"; then
            log "Detected Vite import-analysis missing module error. Attempting safe auto-fix..."
            
            # Extract import path and importer from error
            local import_line="$(echo "$error_info" | grep "Failed to resolve import" | head -1)"
            local import_path="$(echo "$import_line" | sed -n 's/.*import "\([^"]*\)" from "\([^"]*\)".*/\1/p')"
            local importer_path="$(echo "$import_line" | sed -n 's/.*from "\([^"]*\)".*/\1/p')"
            
            if [[ -n "$import_path" && -n "$importer_path" ]]; then
                log "Extracted import: $import_path, importer: $importer_path"
                
                # First try to restore deleted file
                if safe_restore_deleted_file "$import_path" "$importer_path"; then
                    log "Successfully restored deleted file using git restore. Rerunning loop..."
                    # Continue to next loop iteration
                    continue
                fi
                
                # If git restore didn't work, try to update import to moved file
                if safe_update_import "$import_path" "$importer_path"; then
                    log "Successfully updated import to point to moved file. Rerunning loop..."
                    # Continue to next loop iteration
                    continue
                fi
                
                log "Could not auto-fix import $import_path. Will use OpenCode..."
            fi
        fi
        
        # Determine if we should stop and report
        if [[ "$error_class" == "STOP_AND_REPORT" ]]; then
            log "Unsafe error detected. Stopping and reporting."
            echo "UNSAFE ERROR STOP: $error_info" >> "$DEV_LOG" 2>/dev/null || true
            break
        fi
        
        # Skip if OpenCode fails
        if ! opencode --help >/dev/null 2>&1; then
            log "OpenCode unavailable. Stopping."
            break
        fi
        
        # Create repair prompt
        log "Creating OpenCode repair prompt..."
        cat > "$REPAIR_PROMPT" << EOF
# Exire Dev Server Repair Prompt

## Current Error
**Error Details:** $error_info

## Current Git Status
$(git status --short 2>/dev/null || echo "No git status available")

## Git Diff Summary
$(git diff --stat 2>/dev/null || echo "No changes")

## Instructions for OpenCode

1. **Inspect First:** Examine the exact error above and the current code state.

2. **Fix Only Current Top Error:** Address only the specific error that's preventing the dev server from starting. Do not fix other issues.

3. **Minimal Changes:** 
   - Make the smallest possible change that resolves this error.
   - Do not redesign UI or refactor unrelated code.
   - Do not rewrite hundreds of imports or large sections.

4. **Safe Scope:** 
   - Do not touch Supabase/auth/Edge Functions/OpenRouter unless the error directly points there.
   - Do not delete large sections or create broad refactors.

5. **Run Safe Changes Only:** Ensure all changes are safe to apply without product decisions.

6. **Avoiding Broad Refactors:** Do not change anything beyond what's necessary for this single error fix.

7. **Summarize Changes:** After editing, provide a concise summary of:
   - Root cause
   - Files changed
   - Why the fix is narrow
   - What to test next

## Safety Rules Applied
|- Maximum 6 repair loops
|- Fix one error at a time
|- No commits, pushes, or merges
|- Branch: exire/automation-dev-repair-loop
|- Paths quoted due to spaces in repository path
|- OpenCode model: cohere/north-mini-code:free (NOT nemotron)
|- Project: Exire (React/TypeScript/Vite with multi-language support)
|- Emergency mode: Immediate action, manual validation required
|- No UI changes, no translation cleanup unless error specifically points there
|- CRITICAL: Do NOT use curl success as proof the app works. Vite can show browser overlay errors even when the server responds.
|- CRITICAL: Look for Vite import-analysis errors in the dev server logs, not just curl success.

---

Generated: $(date)
Loop: $LOOP_COUNT
Repository: $REPO_ROOT
EOF
        
        log "Repair prompt created: $REPAIR_PROMPT"
        log "OpenCode model being used: cohere/north-mini-code:free"
        log "Focus: Fix only the current top error, avoid broad refactors and redesigns"
        log "CRITICAL: This repair prompt specifically warns that curl success does NOT mean the app works in browser"
        
        # Run OpenCode
        log "Running OpenCode to fix this error..."
        if opencode run "$REPAIR_PROMPT" > "$OPENCODE_OUT" 2>&1; then
            log "OpenCode completed successfully. Output saved to: $OPENCODE_OUT"
            
            # Check OpenCode output for errors
            if grep -q -E "(error|Error|failed|Failed)" "$OPENCODE_OUT" 2>/dev/null; then
                log "WARNING: OpenCode output contains error messages"
            fi
            
            # Kill the failed dev server
            if kill -0 $DEV_PID 2>/dev/null; then
                kill $DEV_PID 2>/dev/null
                wait $DEV_PID 2>/dev/null || true
            fi
            
            continue
        else
            log "OpenCode failed to run. Stopping."
            break
        fi
    fi
    
    # If timeout reached
    if [[ $elapsed_time -ge $TIMEOUT_SECONDS ]]; then
        log "Timeout reached. Killing dev server and stopping."
        if kill -0 $DEV_PID 2>/dev/null; then
            kill $DEV_PID 2>/dev/null
            wait $DEV_PID 2>/dev/null || true
        fi
        break
    fi
done

# Final Summary
log "=== REPAIR LOOP FINAL SUMMARY ==="
log "Total loops completed: $LOOP_COUNT/$MAX_LOOPS"
log "Dev log: $DEV_LOG"
log "OpenCode output: $OPENCODE_OUT"
log "Repair prompt: $REPAIR_PROMPT"

# Check current status
log "Final git status: $(git status --short 2>/dev/null)"
log "Final git diff (stat): $(git diff --stat 2>/dev/null || echo 'No changes')"

# Check if dev server is running (should not be in cleanup)
if [[ -n "${DEV_PID:-}" ]] && kill -0 $DEV_PID 2>/dev/null; then
    log "Cleaning up remaining dev server..."
    kill $DEV_PID 2>/dev/null
    wait $DEV_PID 2>/dev/null || true
fi

log "=== REPAIR LOOP COMPLETED ==="
log "Target: Make Exire load again through automatic Hermes + OpenCode dev repair loop"
log "Focus: Boot/dev-server repair only - no UI changes, no translation cleanup unless error points there"
log "IMPORTANT: Never use nemotron model - only cohere/north-mini-code:free"
log "INTEGRITY: Script rewritten to properly detect Vite overlay/brower errors, not just server responsiveness"

exit 0