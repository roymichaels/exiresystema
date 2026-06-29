#!/bin/bash

# Ticket Quality Analyzer Script
# Purpose: Analyzes implementation tickets to identify quality issues and improvement opportunities
# Author: BizOS Continuous Improvement Pipeline
# Version: 1.0
# Last Updated: $(date)

# Configuration
current_timestamp=$(date '+%Y%m%d-%H%M%S')
ticket_quality_output="reports/vision/ticket-quality-analysis-${current_timestamp}.md"
log_file="logs/ticket-quality-analyzer-${current_timestamp}.log"

# Create necessary directories
mkdir -p reports/vision
mkdir -p logs

# Initialize analysis log
echo "=== Ticket Quality Analyzer started at $(date) ===" > "$log_file"
echo "Analyzing BizOS implementation tickets for quality and completeness..." >> "$log_file"

# Function to log messages
log() {
    echo "[$current_timestamp] $1" | tee -a "$log_file"
}

# Function to analyze ticket structure
analyze_ticket() {
    local ticket_file=$1
    local ticket_name=$(basename "$ticket_file")
    
    if [[ ! -f "$ticket_file" ]]; then
        log "WARNING: Ticket file not found - $ticket_file"
        return 1
    fi
    
    log "ANALYZING: $ticket_name"
    
    # Extract ticket metadata
    local ticket_type=$(grep -i "ticket" "$ticket_file" | head -1 || echo "Unknown")
    local scope=$(grep -i "scope" "$ticket_file" | head -1 || echo "Not specified")
    local acceptance_criteria=$(grep -i "acceptance criteria" "$ticket_file" | head -1 || echo "Not specified")
    
    # Extract acceptance criteria
    local acceptance_count=$(grep -i "acceptance criteria" "$ticket_file" | wc -l)
    
    # Check for required sections
    local required_sections=0
    local optional_sections=0
    
    # Check for common required sections
    if grep -q -i "goal" "$ticket_file"; then
        required_sections=$((required_sections + 1))
    fi
    if grep -q -i "scope" "$ticket_file"; then
        required_sections=$((required_sections + 1))
    fi
    if grep -q -i "acceptance criteria" "$ticket_file"; then
        required_sections=$((required_sections + 1))
    fi
    if grep -q -i "risk" "$ticket_file"; then
        required_sections=$((required_sections + 1))
    fi
    if grep -q -i "files not to touch" "$ticket_file"; then
        required_sections=$((required_sections + 1))
    fi
    
    # Check for optional sections
    if grep -q -i "qa checklist" "$ticket_file"; then
        optional_sections=$((optional_sections + 1))
    fi
    if grep -q -i "manual qa" "$ticket_file"; then
        optional_sections=$((optional_sections + 1))
    fi
    if grep -q -i "automation level" "$ticket_file"; then
        optional_sections=$((optional_sections + 1))
    fi
    
    # Output analysis results
    echo "=== Ticket Analysis Results ===" >&2
    echo "Ticket: $ticket_name" >&2
    echo "Type: $ticket_type" >&2
    echo "Scope: $scope" >&2
    echo "Acceptance Criteria Sections: $acceptance_count" >&2
    echo "Required Sections Present: $required_sections/5" >&2
    echo "Optional Sections Present: $optional_sections/3" >&2
    
    # Determine ticket quality
    local quality_score=$(( (required_sections * 20) + (optional_sections * 15) ))
    
    # Classify ticket
    local classification=""
    if [[ $quality_score -ge 100 ]]; then
        classification="EXCELLENT"
    elif [[ $quality_score -ge 80 ]]; then
        classification="GOOD"
    elif [[ $quality_score -ge 60 ]]; then
        classification="NEEDS_IMPROVEMENT"
    else
        classification="POOR"
    fi
    
    echo "Quality Score: $quality_score" >&2
    echo "Classification: $classification" >&2
    
    log "Ticket classified as: $classification (Score: $quality_score)"
}

# Main analysis function
run_ticket_analysis() {
    log "=== Starting Ticket Quality Analysis ==="
    
    # Get all ticket files - fixed path using proper expansion
    ticket_dir="/home/roymichaels/Desktop/AI Management/exire/tickets"
    
    if [[ ! -d "$ticket_dir" ]]; then
        log "WARNING: Tickets directory not found - $ticket_dir"
        # Create placeholder report if no tickets directory
        generate_placeholder_ticket_report
        return
    fi
    
    ticket_files=($(find "$ticket_dir" -name "*.md" -type f 2>/dev/null | sort))
    
    if [[ ${#ticket_files[@]} -eq 0 ]]; then
        log "WARNING: No ticket files found in tickets directory"
        # Create placeholder report if no tickets
        generate_placeholder_ticket_report
        return
    fi
    
    log "Found ${#ticket_files[@]} ticket files for analysis"
    
    # Analyze each ticket
    for ticket_file in "${ticket_files[@]}"; do
        analyze_ticket "$ticket_file"
    done
    
    log "Ticket quality analysis completed"
    
    # Generate quality report
    generate_ticket_quality_report
}

# Generate placeholder report for no tickets
generate_placeholder_ticket_report() {
    local report_file="${ticket_quality_output}"
    
    echo "# Ticket Quality Analysis Report" > "$report_file"
    echo "Generated at: $(date)" >> "$report_file"
    echo "Analysis Type: GitHub Tickets Quality Assessment" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Executive Summary" >> "$report_file"
    echo "This is a placeholder report for ticket quality analysis." >> "$report_file"
    echo "The full ticket quality analyzer script is generating reports for all available tickets." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Current Status" >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Recommendations" >> "$report_file"
    echo "1. Continue adding comprehensive tickets with full sections" >> "$report_file"
    echo "2. Ensure all tickets include acceptance criteria" >> "$report_file"
    echo "3. Add manual QA checklists for better testing coverage" >> "$report_file"
    echo "4. Implement automation level specifications" >> "$report_file"
    echo "5. Include files-not-to-touch sections for protection" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "---" >> "$report_file"
    echo "*Placeholder Report - Tickets Available: ${#ticket_files[@]}*" >> "$report_file"
    echo "*This report will be replaced with detailed analysis when tickets are available*" >> "$report_file"
    
    log "Placeholder ticket quality report generated: $report_file"
}

# Generate comprehensive ticket quality report
generate_ticket_quality_report() {
    local report_file="${ticket_quality_output}"
    local total_tickets=${#ticket_files[@]}
    
    echo "# BizOS Ticket quality Analysis Report" > "$report_file"
    echo "Generated at: $(date)" >> "$report_file"
    echo "Analysis Type: GitHub Tickets Quality Assessment" >> "$report_file"
    echo " " >> "$report_file"
    
    if [[ $total_tickets -eq 0 ]]; then
        echo "## Executive Summary" >> "$report_file"
        echo "No tickets found for analysis." >> "$report_file"
        echo " " >> "$report_file"
        echo "## Recommendations" >> "$report_file"
        echo "1. Create comprehensive tickets with full sections" >> "$report_file"
        echo "2. Ensure all tickets include acceptance criteria" >> "$report_file"
        echo "3. Add manual QA checklists for testing" >> "$report_file"
        echo "4. Implement automation level specifications" >> "$report_file"
        echo "5. Include files-not-to-touch sections" >> "$report_file"
        echo " " >> "$report_file"
        echo "---" >> "$report_file"
        echo "*No Tickets Available*" >> "$report_file"
        return
    fi
    
    echo "## Executive Summary" >> "$report_file"
    echo "Analysis of $total_tickets tickets for quality and completeness." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Ticket Analysis Summary" >> "$report_file"
    echo "- **Total Tickets**: $total_tickets" >> "$report_file"
    echo "- **Average Quality Score**: 0/100 (placeholder until actual analysis)" >> "$report_file"
    echo "- **High-Quality Tickets**: 0 (placeholder until actual analysis)" >> "$report_file"
    echo "- **Needs Improvement**: $total_tickets (placeholder until actual analysis)" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Quality Assessment" >> "$report_file"
    echo "" >> "$report_file"
    echo "### Required Sections Analysis" >> "$report_file"
    echo "Ticket sections that should always be included:" >> "$report_file"
    echo "1. **Goal/Objective** - Clear ticket purpose" >> "$report_file"
    echo "2. **Scope** - Detailed scope definition" >> "$report_file"
    echo "3. **Acceptance Criteria** - Testable verification criteria" >> "$report_file"
    echo "4. **Risk Level** - Risk assessment and mitigation" >> "$report_file"
    echo "5. **Files Not to Touch** - Protected paths list" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "### Optional Sections Enhancement" >> "$report_file"
    echo "Ticket sections that improve quality but are not mandatory:" >> "$report_file"
    echo "1. **Manual QA Checklist** - Manual testing procedures" >> "$report_file"
    echo "2. **Automation Level** - Automation specification" >> "$report_file"
    echo "3. **Implementation Priority** - Priority ranking" >> "$report_file"
    echo "4. **Special Instructions** - Implementation notes" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "## Recommendations for Ticket Improvement" >> "$report_file"
    echo "1. **Create Comprehensive Tickets**: Include all required sections" >> "$report_file"
    echo "2. **Standardize Template**: Use consistent ticket structure" >> "$report_file"
    echo "3. **Quality Review Process**: Implement peer review" >> "$report_file"
    echo "4. **Automation Integration**: Specify automation levels" >> "$report_file"
    echo "5. **Testing Coverage**: Include manual QA checklists" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Sample Quality Ticket Template" >> "$report_file"
    echo "" >> "$report_file"
    echo "```markdown" >> "$report_file"
    echo "# [Ticket ID]: Brief descriptive name" >> "$report_file"
    echo "## Goal" >> "$report_file"
    echo "Clear, measurable goal for this ticket" >> "$report_file"
    echo " " >> "$report_file"
    echo "## Scope" >> "$report_file"
    echo "Detailed scope with boundaries and exclusions" >> "$report_file"
    echo " " >> "$report_file"
    echo "## Acceptance Criteria" >> "$report_file"
    echo "1. [ ] Condition 1" >> "$report_file"
    echo "2. [ ] Condition 2" >> "$report_file"
    echo "3. [ ] Condition 3" >> "$report_file"
    echo " " >> "$report_file"
    echo "## Risk Level: MEDIUM" >> "$report_file"
    echo "## Files Not to Touch" >> "$report_file"
    echo "- src/supabase/" >> "$report_file"
    echo "- src/auth/" >> "$report_file"
    echo "- src/payments/" >> "$report_file"
    echo " " >> "$report_file"
    echo "## Manual QA Checklist" >> "$report_file"
    echo "- [ ] Manual testing completed" >> "$report_file"
    echo "- [ ] User acceptance testing passed" >> "$report_file"
    echo "- [ ] Regression testing completed" >> "$report_file"
    echo " " >> "$report_file"
    echo "## Implementation Priority: HIGH" >> "$report_file"
    echo "```" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "---" >> "$report_file"
    echo "*BizOS Ticket Quality Analysis Report*" >> "$report_file"
    echo "*Generated by BizOS Ticket Quality Analyzer*" >> "$report_file"
    echo "*This is a read-only analysis tool - no modifications to source files*" >> "$report_file"
    
    log "Comprehensive ticket quality report generated: $report_file"
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_ticket_analysis
fi