#!/bin/bash

# Dev Health Analyzer Script
# Runs safe health checks and reports system status
# Usage: ./scripts/ai/analyzers/dev-health.sh [output_dir]

REPO_ROOT="/home/roymichaels/Desktop/AI Management/exire"
OUTPUT_DIR="${1:-$REPO_ROOT/reports/analyzers}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="$OUTPUT_DIR/dev-health-${TIMESTAMP}.md"

mkdir -p "$OUTPUT_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$REPORT_FILE"
}

error_log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >> "$REPORT_FILE"
    exit 1
}

log "=== Exire Dev Health Analyzer ==="
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

# Analyze package.json
log "\n=== Package Analysis ==="
if [[ -f "$REPO_ROOT/package.json" ]]; then
    log "✓ package.json exists"
    
    # Check for development scripts
    dev_scripts=$(grep '"scripts"' "$REPO_ROOT/package.json" | head -1)
    if [[ -n "$dev_scripts" ]]; then
        log "✓ Development scripts found"
        
        # Extract script names for analysis
        scripts=$(grep -A 50 '"scripts"' "$REPO_ROOT/package.json" | grep '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/"//;s/,//;s/://' | grep -v '^$')
        
        if [[ -n "$scripts" ]]; then
            log "Available scripts: ${scripts[*]}"
            
            # Check for key scripts
            has_build=false
            has_typecheck=false
            has_lint=false
            has_test=false
            
            for script in $scripts; do
                case "$script" in
                    "build") has_build=true ;;
                    "typecheck") has_typecheck=true ;;
                    "lint") has_lint=true ;;
                    "test") has_test=true ;;
                esac
            done
            
            log "\n=== Script Availability ==="
            log "Build script: $has_build"
            log "Typecheck script: $has_typecheck"
            log "Lint script: $has_lint"
            log "Test script: $has_test"
        fi
    else
        log "✗ No development scripts found in package.json"
    fi
else
    log "✗ package.json not found"
fi

# Check for key configuration files
log "\n=== Configuration Check ==="
config_files=("package.json" "vite.config.ts" "tsconfig.json")
for config_file in "${config_files[@]}"; do
    if [[ -f "$REPO_ROOT/$config_file" ]]; then
        log "✓ $config_file exists"
    else
        log "✗ $config_file missing"
    fi
done

# Check source directory structure
log "\n=== Source Structure Analysis ==="
if [[ -d "$REPO_ROOT/src" ]]; then
    source_files=$(find "$REPO_ROOT/src" -name "*.tsx" -o -name "*.ts" | head -10)
    if [[ -n "$source_files" ]]; then
        log "✓ Source directory contains TypeScript files"
        log "Sample files: $(echo "$source_files" | head -3 | tr '\n' ', ' | sed 's/, $//')"
    else
        log "✗ No TypeScript files found in src/"
    fi
    
    # Check for common component patterns
    if [[ -d "$REPO_ROOT/src/components" ]]; then
        component_count=$(find "$REPO_ROOT/src/components" -name "*.tsx" -o -name "*.ts" | wc -l)
        log "✓ Components directory: $component_count components"
    fi
    
    if [[ -d "$REPO_ROOT/src/pages" ]]; then
        page_count=$(find "$REPO_ROOT/src/pages" -name "*.tsx" -o -name "*.ts" | wc -l)
        log "✓ Pages directory: $page_count pages"
    fi
else
    log "✗ src/ directory not found"
fi

# Run build if available
if command -v bun >/dev/null 2>&1 && [[ -f "$REPO_ROOT/package.json" ]]; then
    log "\n=== Build Validation ==="
    
    # Check package.json for build script
    if grep -q '"build"' "$REPO_ROOT/package.json"; then
        log "Build script detected, running build..."
        if timeout 300 bun run build > "$OUTPUT_DIR/build-log-${TIMESTAMP}.log" 2>&1; then
            log "✓ Build successful"
            BUILD_STATUS="SUCCESS"
        else
            build_exit_code=$?
            if [[ $build_exit_code -eq 124 ]]; then
                log "⚠ Build timeout (30 seconds)"
                BUILD_STATUS="TIMEOUT"
            else
                log "✗ Build failed with exit code: $build_exit_code"
                BUILD_STATUS="FAILED"
                
                # Extract error information
                if [[ -f "$OUTPUT_DIR/build-log-${TIMESTAMP}.log" ]]; then
                    first_error=$(head -5 "$OUTPUT_DIR/build-log-${TIMESTAMP}.log")
                    log "First build error: $first_error"
                fi
            fi
        fi
    else
        log "✗ No build script found in package.json"
        BUILD_STATUS="NO_SCRIPT"
    fi
else
    log "✗ Bun or package.json not available"
    BUILD_STATUS="UNAVAILABLE"
fi

# Run typecheck if available
if command -v bun >/dev/null 2>&1 && [[ -f "$REPO_ROOT/package.json" ]]; then
    log "\n=== TypeCheck Validation ==="
    
    # Check package.json for typecheck script
    if grep -q '"typecheck"' "$REPO_ROOT/package.json" || grep -q '"tsc"' "$REPO_ROOT/package.json"; then
        log "Typecheck script detected, running typecheck..."
        if timeout 300 bun run typecheck > "$OUTPUT_DIR/typecheck-log-${TIMESTAMP}.log" 2>&1; then
            log "✓ Typecheck successful"
            TYPECHECK_STATUS="SUCCESS"
        else
            typecheck_exit_code=$?
            if [[ $typecheck_exit_code -eq 124 ]]; then
                log "⚠ Typecheck timeout (30 seconds)"
                TYPECHECK_STATUS="TIMEOUT"
            else
                log "✗ Typecheck failed with exit code: $typecheck_exit_code"
                TYPECHECK_STATUS="FAILED"
                
                # Extract type error information
                if [[ -f "$OUTPUT_DIR/typecheck-log-${TIMESTAMP}.log" ]]; then
                    type_errors=$(grep -i "error" "$OUTPUT_DIR/typecheck-log-${TIMESTAMP}.log" | head -3)
                    if [[ -n "$type_errors" ]]; then
                        log "Type errors found: $type_errors"
                    fi
                fi
            fi
        fi
    else
        log "✗ No typecheck script found in package.json"
        TYPECHECK_STATUS="NO_SCRIPT"
    fi
else
    log "✗ Bun or package.json not available"
    TYPECHECK_STATUS="UNAVAILABLE"
fi

# Run lint if available
if command -v bun >/dev/null 2>&1 && [[ -f "$REPO_ROOT/package.json" ]]; then
    log "\n=== Lint Validation ==="
    
    # Check package.json for lint script
    if grep -q '"lint"' "$REPO_ROOT/package.json"; then
        log "Lint script detected, running lint..."
        if timeout 300 bun run lint > "$OUTPUT_DIR/lint-log-${TIMESTAMP}.log" 2>&1; then
            log "✓ Lint successful"
            LINT_STATUS="SUCCESS"
        else
            lint_exit_code=$?
            if [[ $lint_exit_code -eq 124 ]]; then
                log "⚠ Lint timeout (30 seconds)"
                LINT_STATUS="TIMEOUT"
            else
                log "✗ Lint failed with exit code: $lint_exit_code"
                LINT_STATUS="FAILED"
                
                # Extract lint error information
                if [[ -f "$OUTPUT_DIR/lint-log-${TIMESTAMP}.log" ]]; then
                    lint_errors=$(grep -i "error" "$OUTPUT_DIR/lint-log-${TIMESTAMP}.log" | head -3)
                    if [[ -n "$lint_errors" ]]; then
                        log "Lint errors found: $lint_errors"
                    fi
                fi
            fi
        fi
    else
        log "✗ No lint script found in package.json"
        LINT_STATUS="NO_SCRIPT"
    fi
else
    log "✗ Bun or package.json not available"
    LINT_STATUS="UNAVAILABLE"
fi

# Try dev server test if available
if command -v bun >/dev/null 2>&1 && [[ -f "$REPO_ROOT/package.json" ]]; then
    log "\n=== Development Server Test ==="
    
    # Check for dev script
    if grep -q '"dev"' "$REPO_ROOT/package.json"; then
        log "Dev script detected, attempting to start dev server..."
        
        # Start dev server in background
        cd "$REPO_ROOT"
        bun run dev > "$OUTPUT_DIR/dev-server-log-${TIMESTAMP}.log" 2>&1 &
        DEV_PID=$!
        
        # Wait for server to start
        log "Waiting for dev server to start (max 60 seconds)..."
        server_ready=false
        server_error=false
        elapsed_time=0
        
        while [[ $elapsed_time -lt 60 ]]; do
            # Check if process is still running
            if ! kill -0 $DEV_PID 2>/dev/null; then
                log "✗ Dev server process terminated"
                server_error=true
                break
            fi
            
            # Check if server is responding with curl
            if curl -s -f --max-time 2 "http://localhost:5173/" >/dev/null 2>&1; then
                server_ready=true
                log "✓ Dev server responding to HTTP requests"
                break
            fi
            
            sleep 5
            elapsed_time=$((elapsed_time + 5))
        done
        
        if [[ $server_ready == true ]]; then
            log "✓ Dev server started successfully"
            DEV_STATUS="RUNNING"
            
            # Test page load
            if curl -s "http://localhost:5173/" > /dev/null 2>&1; then
                log "✓ Page loads successfully"
                PAGE_STATUS="LOADED"
            else
                log "⚠ Page load test failed"
                PAGE_STATUS="FAILED"
            fi
            
            # Check for Vite overlay errors in server logs
            if [[ -f "$OUTPUT_DIR/dev-server-log-${TIMESTAMP}.log" ]]; then
                if grep -q -E "(error:|Error:|vite.*error|compilation failed)" "$OUTPUT_DIR/dev-server-log-${TIMESTAMP}.log" 2>/dev/null; then
                    log "⚠ Vite overlay errors detected in server logs"
                    VITE_STATUS="ERRORS"
                else
                    log "✓ No Vite overlay errors in server logs"
                    VITE_STATUS="HEALTHY"
                fi
            fi
            
            # Stop dev server
            kill $DEV_PID 2>/dev/null || true
            wait $DEV_PID 2>/dev/null || true
            log "✓ Dev server stopped"
            
        elif [[ $server_error == true ]]; then
            log "✗ Dev server failed to start"
            DEV_STATUS="FAILED"
            PAGE_STATUS="UNKNOWN"
            VITE_STATUS="UNKNOWN"
        else
            log "⚠ Dev server timeout (60 seconds)"
            DEV_STATUS="TIMEOUT"
            PAGE_STATUS="UNKNOWN"
            VITE_STATUS="UNKNOWN"
            kill $DEV_PID 2>/dev/null || true
        fi
        
    else
        log "✗ No dev script found in package.json"
        DEV_STATUS="NO_SCRIPT"
        PAGE_STATUS="UNKNOWN"
        VITE_STATUS="UNKNOWN"
    fi
else
    log "✗ Bun or package.json not available"
    DEV_STATUS="UNAVAILABLE"
    PAGE_STATUS="UNKNOWN"
    VITE_STATUS="UNKNOWN"
fi

# Generate comprehensive report
log "\n=== SYSTEM HEALTH SUMMARY ==="
log "Build Status: $BUILD_STATUS"
log "TypeCheck Status: $TYPECHECK_STATUS"
log "Lint Status: $LINT_STATUS"
log "Dev Server Status: $DEV_STATUS"
log "Page Load Status: $PAGE_STATUS"
log "Vite Health: $VITE_STATUS"

# Determine overall system health
overall_health="HEALTHY"
if [[ $BUILD_STATUS != "SUCCESS" ]] || [[ $TYPECHECK_STATUS != "SUCCESS" ]] || [[ $LINT_STATUS != "SUCCESS" ]] || [[ $DEV_STATUS != "RUNNING" ]] || [[ $VITE_STATUS == "ERRORS" ]]; then
    overall_health="UNHEALTHY"
fi

log "\n=== OVERALL SYSTEM HEALTH ==="
log "System Health: $overall_health"

if [[ $overall_health == "UNHEALTHY" ]]; then
    log "⚠ SYSTEM UNHEALTHY - Action required to fix issues above"
    log "\nCritical Issues Found:"
    
    if [[ $BUILD_STATUS != "SUCCESS" ]]; then
        log "- Build failed: Check build logs for details"
    fi
    
    if [[ $TYPECHECK_STATUS != "SUCCESS" ]]; then
        log "- Type checking failed: Check typecheck logs for details"
    fi
    
    if [[ $LINT_STATUS != "SUCCESS" ]]; then
        log "- Linting failed: Check lint logs for details"
    fi
    
    if [[ $DEV_STATUS != "RUNNING" ]]; then
        log "- Development server not running"
    fi
    
    if [[ $VITE_STATUS == "ERRORS" ]]; then
        log "- Vite overlay errors detected"
    fi
    
    log "\nRecommended Actions:"
    log "1. Address build failures first (most critical)"
    log "2. Fix type checking errors"
    log "3. Resolve linting issues"
    log "4. Investigate development server problems"
    log "5. Check for Vite overlay errors"
else
    log "✅ SYSTEM HEALTHY - Ready for development"
fi

log "\n=== ANALYSIS COMPLETE ==="
log "Report saved to: $REPORT_FILE"
log "All logs: $OUTPUT_DIR/"

exit 0