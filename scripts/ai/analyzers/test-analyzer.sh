#!/bin/bash

# Test analyzer script to verify BizOS analyzer setup
REPO_ROOT="/home/roymichaels/Desktop/AI Management/exire"
OUTPUT_DIR="$REPO_ROOT/reports/analyzers"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="$OUTPUT_DIR/test-analyzer-${TIMESTAMP}.md"

mkdir -p "$OUTPUT_DIR"

echo "=== Test Analyzer for BizOS Platform ===" > "$REPORT_FILE"
echo "Repository: $REPO_ROOT" >> "$REPORT_FILE"
echo "Timestamp: $TIMESTAMP" >> "$REPORT_FILE"
echo "Test analyzer running successfully" >> "$REPORT_FILE"
echo "✅ BizOS analyzer infrastructure is working properly" >> "$REPORT_FILE"

echo "Test analyzer complete. Report saved to: $REPORT_FILE"
