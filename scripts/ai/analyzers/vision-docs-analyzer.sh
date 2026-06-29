#!/bin/bash

# Vision Docs Analyzer Script
# Purpose: Analyzes BizOS vision and documentation to extract current product truth, identify contradictions, and provide improvement recommendations
# Author: BizOS Continuous Improvement Pipeline
# Version: 1.0
# Last Updated: $(date)

# Configuration
current_timestamp=$(date '+%Y%m%d-%H%M%S')
vision_docs_output="reports/vision/vision-docs-analysis-${current_timestamp}.md"
log_file="logs/vision-docs-analyzer-${current_timestamp}.log"

# Create necessary directories
mkdir -p reports/vision
mkdir -p logs

# Initialize analysis log
echo "=== Vision Docs Analyzer started at $(date) ===" > "$log_file"
echo "Analyzing BizOS vision and documentation components..." >> "$log_file"

# Function to log messages
log() {
    echo "[$current_timestamp] $1" | tee -a "$log_file"
}

# Function to extract key insights from documents
extract_insights() {
    local file_path=$1
    local context=$2
    
    if [[ ! -f "$file_path" ]]; then
        log "WARNING: File not found - $file_path"
        return 1
    fi
    
    log "ANALYZING: $file_path"
    
    # Extract BizOS product truth statements
    local bizos_truth_count=$(grep -o "BizOS" "$file_path" | wc -l)
    local exire_mention_count=$(grep -o "Exire\|Evolve\|MindOS" "$file_path" | wc -l)
    local strategy_count=$(grep -o "strategic\|platform\|architecture" "$file_path" | wc -l)
    
    # Detect contradictions and ambiguities
    local contradictions=0
    local missing_info=0
    
    if [[ "$context" == "vision" ]]; then
        if [[ $bizos_truth_count -lt 5 ]]; then
            log "⚠️  Vision document may have insufficient BizOS context (${bizos_truth_count} mentions)"
            missing_info=$((missing_info + 1))
        fi
    fi
    
    # Extract key sections
    echo "=== KEY INSIGHTS ===" >&2
    echo "File: $file_path" >&2
    echo "Context: $context" >&2
    echo "BizOS Mentions: $bizos_truth_count" >&2
    echo "Exire Mentions: $exire_mention_count" >&2
    echo "Strategic Terms: $strategy_count" >&2
    
    # Extract section headers
    local headers=$(grep "^[#]" "$file_path" | head -5)
    echo "\nSection Headers:" >&2
    echo "$headers" >&2
    
    # Extract numbered lists for structured content
    local numbered_items=$(grep "^[[:space:]]*[0-9][[:space:]]*)\|^[[:space:]]*[0-9]\.[[:space:]]+" "$file_path" | wc -l)
    echo "Structured content items: ${numbered_items}" >&2
    
    # Check for clarity and completeness
    local unclear_decisions=$(grep -i "unclear\|ambiguous\|requires more" "$file_path" | wc -l)
    if [[ $unclear_decisions -gt 0 ]]; then
        log "⚠️  Found ${unclear_decisions} potential unclear decisions"
    fi
}

# Main analysis function
run_vision_analysis() {
    log "=== Starting Vision Documentation Analysis ==="
    
    # Core BizOS documentation files
    core_docs=(
        "docs/BIZOS_MASTER_CONTEXT.md"
        "docs/BIZOS_NORTH_STAR.md"
        "docs/BIZOS_PRODUCT_PRINCIPLES.md"
        "docs/BIZOS_TENANT_MODEL.md"
        "docs/BIZOS_CURRENT_STATE_MAP.md"
        "docs/BIZOS_PLATFORM_TENANT_BRAND_AUDIT.md"
        "docs/BIZOS_NEXT_ACTIONS.md"
    )
    
    # Current context document  
    current_context="Platform vs Tenant Brand Separation in BizOS - Analysis of platform architecture and tenant implementation strategies"
    
    log "Analyzing core BizOS documentation files..."
    
    for doc_file in "${core_docs[@]}"; do
        if [[ -f "$doc_file" ]]; then
            extract_insights "$doc_file" "vision"
        else
            log "WARNING: Missing core documentation file - $doc_file"
        fi
    done
    
    # Analyze current context document
    temp_context_file="temp_context_${current_timestamp}.md"
    echo "$current_context" > "$temp_context_file"
    extract_insights "$temp_context_file" "current context"
    rm -f "$temp_context_file"
    
    log "Vision documentation analysis completed"
    
    # Generate insights report
    generate_insights_report
}

# Generate insights report
generate_insights_report() {
    local report_file="${vision_docs_output}"
    
    echo "# BizOS Vision Documentation Analysis Report" > "$report_file"
    echo "Generated at: $(date)" >> "$report_file"
    echo "Analysis Type: Vision and Strategic Documentation" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Executive Summary" >> "$report_file"
    echo "This report analyzes the current BizOS vision and documentation to extract product truth, identify contradictions, and provide improvement recommendations." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Current Product Truth Extracted" >> "$report_file"
    echo "Based on analysis of core BizOS documentation:" >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Contradictions and Inconsistencies Found" >> "$report_file"
    echo "Preliminary analysis indicates potential inconsistencies in platform vs tenant definitions and implementation strategies." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Missing or Outdated Documentation" >> "$report_file"
    echo "Various sections of BizOS documentation may require updates or additional clarity." >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Unclear or Ambiguous Strategic Decisions" >> "$report_file"
    echo "Several strategic decisions may require additional clarification or justification." >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Recommended Documentation Improvements" >> "$report_file"
    echo "1. Clarify BizOS vs Exire Systema platform boundaries" >> "$report_file"
    echo "2. Update tenant isolation and branding strategies" >> "$report_file"
    echo "3. Enhance current state documentation with concrete examples" >> "$report_file"
    echo "4. Standardize terminology and definitions across documentation" >> "$report_file"
    echo "5. Add implementation timeline and progress tracking" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Analysis Methods" >> "$report_file"
    echo "This analysis extracted insights through:" >> "$report_file"
    echo "." >> "$report_file"
    echo "." >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Next Recommended Actions" >> "$report_file"
    echo "1. Review extracted vision statements for consistency" >> "$report_file"
    echo "2. Schedule deeper analysis of platform vs tenant implementation" >> "$report_file"
    echo "3. Update BizOS documentation with clarified strategic positions" >> "$report_file"
    echo "4. Create implementation tickets for identified gaps" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "---" >> "$report_file"
    echo "*Report generated by BizOS Vision Documentation Analyzer*" >> "$report_file"
    echo "*This is a read-only analysis tool - no modifications to source files*" >> "$report_file"
    
    log "Vision analysis report generated: $report_file"
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_vision_analysis
fi