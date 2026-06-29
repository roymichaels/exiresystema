#!/bin/bash

# Vision Code Gap Analyzer Script
# Purpose: Analyzes BizOS codebase to identify platform vs tenant code classification and gaps
# Author: BizOS Continuous Improvement Pipeline
# Version: 1.0
# Last Updated: $(date)

# Configuration
current_timestamp=$(date '+%Y%m%d-%H%M%S')
vision_code_output="reports/vision/vision-code-gap-analysis-${current_timestamp}.md"
log_file="logs/vision-code-analyzer-${current_timestamp}.log"

# Create necessary directories
mkdir -p reports/vision
mkdir -p logs

# Initialize analysis log
echo "=== Vision Code Gap Analyzer started at $(date) ===" > "$log_file"
echo "Analyzing BizOS codebase structure and platform/tenant classification..." >> "$log_file"

# Function to log messages
log() {
    echo "[$current_timestamp] $1" | tee -a "$log_file"
}

# Function to analyze directory structure
analyze_directory() {
    local dir_path=$1
    local directory_name=$2
    
    if [[ ! -d "$dir_path" ]]; then
        log "WARNING: Directory not found - $dir_path"
        return 1
    fi
    
    log "ANALYZING: $dir_path ($directory_name)"
    
    # Get file types and counts
    local comp_files=$(find "$dir_path" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | wc -l)
    local doc_files=$(find "$dir_path" -name "*.md" -o -name "*.txt" -o -name "*.json" | wc -l)
    local other_files=$(find "$dir_path" -name "*.py" -o -name "*.sh" -o -name "*.css" | wc -l)
    
    # Extract key identifiers
    local exire_refs=$(find "$dir_path" -name "*.tsx" -o -name "*.ts" | xargs grep -l "Exire\|Evolve\|MindOS" 2>/dev/null | wc -l)
    local bizos_refs=$(find "$dir_path" -name "*.tsx" -o -name "*.ts" | xargs grep -l "BizOS" 2>/dev/null | wc -l)
    local platform_refs=$(find "$dir_path" -name "*.tsx" -o -name "*.ts" | xargs grep -l "platform" 2>/dev/null | wc -l)
    local tenant_refs=$(find "$dir_path" -name "*.tsx" -o -name "*.ts" | xargs grep -l "tenant" 2>/dev/null | wc -l)
    
    # Output analysis results
    echo "=== Directory Analysis Results ===" >&2
    echo "Directory: $directory_name" >&2
    echo "Location: $dir_path" >&2
    echo "TypeScript/React Files: $comp_files" >&2
    echo "Documentation Files: $doc_files" >&2
    echo "Other Files: $other_files" >&2
    echo "Exire References: $exire_refs" >&2
    echo "BizOS References: $bizos_refs" >&2
    echo "Platform References: $platform_refs" >&2
    echo "Tenant References: $tenant_refs" >&2
    
    # Determine classification
    local classification="UNKNOWN"
    if [[ $bizos_refs -gt $exire_refs ]]; then
        classification="BizOS Platform"
    elif [[ $exire_refs -gt $bizos_refs ]]; then
        classification="Exire Systema Tenant"
    elif [[ $platform_refs -gt $tenant_refs ]]; then
        classification="Platform-Focused"
    elif [[ $tenant_refs -gt $platform_refs ]]; then
        classification="Tenant-Focused"
    fi
    
    echo "Classification: $classification" >&2
    log "Directory classified as: $classification"
}

# Main analysis function
run_code_analysis() {
    log "=== Starting Code Structure Analysis ==="
    
    # Key directories to analyze
    key_dirs=(
        "src/pages:" "Customer-facing pages and routes"
        "src/components:" "UI component library"
        "src/shell:" "Shell infrastructure"
        "src/shellv2:" "Advanced shell infrastructure"
        "src/routes:" "Application routing"
        "src/i18n:" "Internationalization system"
        "src/hooks:" "React hooks library"
        "src/contexts:" "React context providers"
        "src/domain:" "Business domain logic"
        "src/features:" "Feature implementations"
    )
    
    echo "=== Analyzing Key Directories ===" >&2
    
    for dir_spec in "${key_dirs[@]}"; do
        dir_path=$(echo "$dir_spec" | cut -d':' -f1)
        dir_name=$(echo "$dir_spec}" | cut -d':' -f2-)
        
        analyze_directory "$dir_path" "$dir_name"
    done
    
    # Analyze specific special files
    analyze_special_files
    
    log "Code structure analysis completed"
    
    # Generate analysis report
    generate_code_report
}

# Analyze special files that indicate platform/tenant classification
analyze_special_files() {
    log "=== Analyzing Special Files ==="
    
    # Important component files to check
    special_files=(
        "src/Pages/AdminPanel.tsx"
        "src/Pages/Dashboard.tsx"
        "src/Pages/Login.tsx"
        "src/shell/AppShell.tsx"
        "src/shellv2/AdminShell.tsx"
        "src/routes/Routes.tsx"
        "src/i18n/index.ts"
        "src/i18n/translations/he.ts"
        "src/i18n/translations/en.ts"
        "src/components/AdvisorWidget.tsx"
        "src/components/CRM/Dashboard.tsx"
        "src/components/CustomerPortal.tsx"
        "src/components/InvoiceGenerator.tsx"
        "src/components/SubscriptionManager.tsx"
    )
    
    for file_path in "${special_files[@]}"; do
        if [[ -f "$file_path" ]]; then
            log "ANALYZING: $file_path"
            
            # Extract file content for analysis
            local content=$(cat "$file_path" | tr '\n' ' ' | sed 's/ //g')
            
            # Identify platform vs tenant indicators
            local is_platform=0
            local is_tenant=0
            
            if [[ "$content" =~ "admin\|platform\|superuser\|dashboard" ]]; then
                is_platform=1
            fi
            
            if [[ "$content" =~ "customer\|tenant\|user\|client" ]]; then
                is_tenant=1
            fi
            
            # Extract key component indicators
            local comp_indicators=$(grep -i "export default\|interface\|type.*Props" "$file_path" | wc -l)
            local logic_indicators=$(grep -i "useEffect\|useState\|useContext\|redux\|context" "$file_path" | wc -l)
            
            echo "=== Special File Analysis ===" >&2
            echo "File: $file_path" >&2
            echo "Platform Indicators: $is_platform" >&2
            echo "Tenant Indicators: $is_tenant" >&2
            echo "Component Indicators: $comp_indicators" >&2
            echo "Logic Indicators: $logic_indicators" >&2
            
            if [[ $is_platform -eq 1 && $is_tenant -eq 0 ]]; then
                log "Classified as: Platform Component"
            elif [[ $is_platform -eq 0 && $is_tenant -eq 1 ]]; then
                log "Classified as: Tenant Component"
            elif [[ $is_platform -eq 1 && $is_tenant -eq 1 ]]; then
                log "Classified as: Mixed Platform/Tenant Component"
            else
                log "Classified as: Neutral/Non-specific Component"
            fi
            
        else
            log "WARNING: Special file not found - $file_path"
        fi
    done
}

# Generate code analysis report
generate_code_report() {
    local report_file="${vision_code_output}"
    
    echo "# BizOS Code Structure Gap Analysis Report" > "$report_file"
    echo "Generated at: $(date)" >> "$report_file"
    echo "Analysis Type: Codebase Structure and Platform/Tenant Classification" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Executive Summary" >> "$report_file"
    echo "This report analyzes the current BizOS codebase structure to identify platform vs tenant code classification and gaps between vision requirements and actual implementation." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Platform vs Tenant Code Classification" >> "$report_file"
    echo "Analysis of key directories for platform/tenant code classification:" >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Exire vs BizOS Reference Analysis" >> "$report_file"
    echo "Comparison of code references to BizOS vs Exire Systema:" >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Ambiguous Implementation Areas" >> "$report_file"
    echo "Locations where code classification is unclear or mixed:" >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Recommended Implementation Tickets" >> "$report_file"
    echo "1. Clarify platform vs tenant boundaries in codebase" >> "$report_file"
    echo "2. Standardize component classification and naming" >> "$report_file"
    echo "3. Update special files to reflect correct platform/tenant roles" >> "$report_file"
    echo "4. Implement consistent code classification patterns" >> "$report_file"
    echo "5. Audit existing components for proper classification" >> "$report_file"
    echo " " >> "$report_file"
    
    echo "## Analysis Methods" >> "$report_file"
    echo "This analysis examined:" >> "$report_file"
    echo "." >> "$report_file"
    echo "." >> "$report_file"
    echo "." >> "$report_file"
    echo " " >> "$report_file"
    
    echo "---" >> "$report_file"
    echo "*Report generated by BizOS Vision Code Gap Analyzer*" >> "$report_file"
    echo "*This is a read-only analysis tool - no modifications to source files*" >> "$report_file"
    
    log "Code gap analysis report generated: $report_file"
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_code_analysis
fi