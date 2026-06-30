#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "BizOS analyzer runner"
echo "Mode: stdout-only / read-only / proposal-only"
echo "Auto-fix: OFF"
echo "Auto-approval: OFF"
echo "Reports: OFF for Phase B.1.5"
echo ""

REQUIRED_SCRIPTS=(
"scripts/ai/vision-improvement-loop.sh"
"scripts/ai/analyzers/vision-docs-analyzer.sh"
"scripts/ai/analyzers/vision-code-gap-analyzer.sh"
"scripts/ai/analyzers/ticket-quality-analyzer.sh"
)

OPTIONAL_SUPPORT_SCRIPTS=(
"scripts/ai/analyzers/dev-health.sh"
"scripts/ai/analyzers/vite-overlay-check.sh"
)

missing_count=0
syntax_fail_count=0

echo "Checking required Phase B.1 scripts…"
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        echo "FOUND: $script"
    else
        echo "MISSING: $script"
        missing_count=$((missing_count + 1))
    fi
done

echo ""
echo "Running bash syntax checks for required scripts…"
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        if bash -n "$script"; then
            echo "SYNTAX OK: $script"
        else
            echo "SYNTAX FAIL: $script"
            syntax_fail_count=$((syntax_fail_count + 1))
        fi
    fi
done

echo ""
echo "Checking optional support scripts…"
for script in "${OPTIONAL_SUPPORT_SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        if bash -n "$script"; then
            echo "SUPPORT SYNTAX OK: $script"
        else
            echo "SUPPORT SYNTAX FAIL: $script"
        fi
    else
        echo "SUPPORT MISSING: $script"
    fi
done

echo ""
echo "Summary:"
echo "Missing required scripts: $missing_count"
echo "Required syntax failures: $syntax_fail_count"

if [[ "$missing_count" -gt 0 || "$syntax_fail_count" -gt 0 ]]; then
    echo "Result: NOT READY"
    exit 1
fi

echo "Result: READY FOR MANUAL REVIEW"
echo "No files were created by this runner."
echo "No git operations were performed by this runner."
echo "Dean approval is required before any execution, commit, push, or implementation."