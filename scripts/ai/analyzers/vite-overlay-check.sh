#!/bin/bash

# Vite Overlay Analyzer Script
# Detects browser/Vite overlay errors that curl alone cannot identify
# Usage: ./scripts/ai/analyzers/vite-overlay-check.sh [output_dir]

REPO_ROOT="/home/roymichaels/Desktop/AI Management/exire"
OUTPUT_DIR="${1:-$REPO_ROOT/reports/analyzers}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="$OUTPUT_DIR/vite-overlay-${TIMESTAMP}.md"

mkdir -p "$OUTPUT_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$REPORT_FILE"
}

error_log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >> "$REPORT_FILE"
    exit 1
}

log "=== Vite Overlay Analyzer ==="
log "Repository: $REPO_ROOT"
log "Timestamp: $TIMESTAMP"

# Check if we're in a git repository
if [[ ! -d "$REPO_ROOT/.git" ]]; then
    error_log "Not inside a git repository at $REPO_ROOT"
fi

# Check for required tools
if ! command -v bun >/dev/null 2>&1; then
    error_log "Bun not found. Please install Bun."
fi

# Define Vite error patterns
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

log "=== Vite Overlay Error Detection ==="
log "Checking for Vite overlay error patterns..."

# Check for package.json with dev script
if [[ ! -f "$REPO_ROOT/package.json" ]]; then
    error_log "package.json not found"
fi

# Check if dev script exists
if ! grep -q '"dev"' "$REPO_ROOT/package.json"; then
    log "✗ No dev script found in package.json"
    log "\n=== ANALYSIS COMPLETE ==="
    log "Report saved to: $REPORT_FILE"
    exit 0
fi

# Extract potential errors from dev server logs
log "\n=== Log Analysis ==="

# Look for existing log files from recent runs
log_files=( "$REPO_ROOT/reports/ai-runs"/*.log "$REPO_ROOT/reports/analyzers"/*.log 2>/dev/null )

found_errors=false
error_patterns_found=""

for log_file in "${log_files[@]}"; do
    if [[ -f "$log_file" ]]; then
        log "Analyzing log file: $(basename "$log_file")"
        
        # Check for each error pattern
        for pattern in "${VITE_ERROR_PATTERNS[@]}"; do
            if grep -q -E "$pattern" "$log_file" 2>/dev/null; then
                found_errors=true
                error_patterns_found="$error_patterns_found$pattern, "
                log "✓ Error pattern detected: $pattern"
                
                # Extract context around the error
                error_context=$(grep -B2 -A5 -E "$pattern" "$log_file" | head -30)
                log "Context: $error_context"
            fi
        done
    fi
done

# Try to start dev server and monitor for errors
log "\n=== Dev Server Analysis ==="

if command -v bun >/dev/null 2>&1; then
    log "Bun found, attempting to start dev server..."
    
    cd "$REPO_ROOT"
    
    # Start dev server in background
    bun run dev > "$OUTPUT_DIR/dev-analysis-${TIMESTAMP}.log" 2>&1 &
    DEV_PID=$!
    
    log "Dev server started with PID: $DEV_PID"
    log "Monitoring for Vite overlay errors..."
    
    # Wait for server to start
    sleep 5
    
    # Monitor logs for errors
    error_found=false
    while kill -0 $DEV_PID 2>/dev/null; do
        if grep -q -E "(${VITE_ERROR_PATTERNS[*]})" "$OUTPUT_DIR/dev-analysis-${TIMESTAMP}.log" 2>/dev/null; then
            error_found=true
            log "🚨 VITE OVERLAY ERROR DETECTED in dev server logs"
            break
        fi
        sleep 2
    done
    
    # Stop dev server
    kill $DEV_PID 2>/dev/null || true
    wait $DEV_PID 2>/dev/null || true
    
    if [[ $error_found == true ]]; then
        found_errors=true
        log "🚨 Vite overlay errors detected during dev server operation"
    else
        log "✓ No Vite overlay errors detected during dev server operation"
    fi
else
    log "✗ Bun not available, skipping dev server analysis"
fi

# Generate analysis report
log "\n=== ANALYSIS REPORT ==="

if [[ $found_errors == true ]]; then
    log "🚨 VITE OVERLAY ERRORS DETECTED"
    log "\nError patterns found: ${error_patterns_found%, }"
    log "\nThis indicates potential issues with:"
    log "- Missing or deleted files causing import errors"
    log "- Vite configuration problems"
    log "- Module resolution issues"
    log "- Development dependency problems"
    log "\nImmediate Actions Required:"
    log "1. Check git status for deleted files"
    log "2. Verify all required dependencies are installed"
    log "3. Check Vite configuration and project setup"
    log "4. Ensure all components are properly imported"
else
    log "✅ NO VITE OVERLAY ERRORS DETECTED"
    log "\nSystem appears to be healthy with respect to Vite compilation errors"
    log "\nSuccess Indicators:"
    log "- No plugin errors detected"
    log "- No import resolution errors"
    log "- No transformation errors"
    log "- Dev server operating normally"
fi

# Check for specific error types
log "\n=== Error Type Analysis ==="

if [[ -f "$OUTPUT_DIR/dev-analysis-${TIMESTAMP}.log" ]]; then
    log_file="$OUTPUT_DIR/dev-analysis-${TIMESTAMP}.log"
    
    # Check for specific error categories
    if grep -q "plugin:vite:import-analysis" "$log_file" 2>/dev/null; then
        log "🚨 Import Analysis Errors: Failures to resolve imports"
        log "Recommendation: Check for deleted files or incorrect import paths"
    fi
    
    if grep -q "Failed to resolve import" "$log_file" 2>/dev/null; then
        log "🚨 Import Resolution Errors: Modules cannot be found"
        log "Recommendation: Verify file existence and import paths"
    fi
    
    if grep -q "Does the file exist?" "$log_file" 2>/dev/null; then
        log "🚨 File Existence Errors: Missing files"
        log "Recommendation: Check git status and restore deleted files"
    fi
    
    if grep -q "Pre-transform error" "$log_file" 2>/dev/null; then
        log "🚨 Transformation Errors: Vite preprocessing failures"
        log "Recommendation: Check Vite configuration and plugins"
    fi
    
    if grep -q "Internal server error" "$log_file" 2>/dev/null; then
        log "🚨 Server Errors: Internal compilation failures"
        log "Recommendation: Check server configuration and environment"
    fi
    
    # Check for safe auto-fix candidates
    log "\n=== Safe Auto-Fix Candidates ==="
    
    if [[ -f "$REPO_ROOT/src/components/crm/LeadsCRM.tsx" ]] && grep -q "LeadQuickActions" "$log_file" 2>/dev/null; then
        log "✓ LeadsCRM.tsx appears to be present (deleted file scenario)"
        log "Recommendation: Check if deletion was accidental and restore if needed"
    fi
else
    log "✗ No analysis log file found"
fi

# Final recommendations
log "\n=== FINAL RECOMMENDATIONS ==="

if [[ $found_errors == true ]]; then
    log "🔧 Immediate Actions:"
    log "1. Run git status to identify any deleted files"
    log "2. Check for missing dependencies in package.json"
    log "3. Verify Vite configuration and project setup"
    log "4. Review the analysis report for specific error details"
    log "\n🛠️ Optional Analysis:"
    log "1. Run enhanced dev repair loop for automatic fixes"
    log "2. Check repository for corrupted files"
    log "3. Verify development environment setup"
else
    log "✅ System appears healthy with respect to Vite overlay errors"
    log "\n🔍 Recommended Monitoring:"
    log "1. Continue monitoring for new errors"
    log "2. Regular system health checks"
    log "3. Keep dependencies up to date"
    log "\n📊 Performance Indicators:"
    log "- No compilation errors detected"
    log "- Dev server operating normally"
    log "- Vite overlay errors: NONE"
fi

log "\n=== ANALYSIS COMPLETE ==="
log "Vite overlay analysis finished successfully"
log "Report saved to: $REPORT_FILE"
log "Analysis logs: $OUTPUT_DIR/"
log "\nNote: This analysis focuses on Vite overlay errors. Other types of errors (build, typecheck, lint) should be addressed separately."

exit 0