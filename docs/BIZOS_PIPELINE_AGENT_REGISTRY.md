# BizOS PIPELINE AGENT REGISTRY

## Overview

The BizOS Pipeline Agent Registry provides a **comprehensive catalog** of all analysis agents, tools, and their specific responsibilities within the BizOS development pipeline. This registry establishes **clear operational boundaries** and **quality standards** for platform evolution while protecting production systems.

**Purpose**: Define, document, and standardize all pipeline components for consistent execution and governance.

**Scope**: Analysis-only and proposal-only operations. **No production code modifications** without explicit Dean approval.

## Agent Classification

### **Level 0: NEVER AUTO-APPROVE** 

**Critical Infrastructure Protection** - Changes that can **never** be auto-approved:

#### 🔴 **High-Risk Agents**
| Agent Name | Purpose | Risk Level | Auto-Approval | Scope |
|------------|---------|------------|---------------|--------|
| **System Infrastructure Guard** | Detects unauthorized access attempts | CRITICAL | ❌ NEVER | System boundaries validation |
| **Production Logic Detector** | Identifies production business logic changes | HIGH | ❌ NEVER | Core functionality protection |
| **Supabase Schema Monitor** | Monitors database structure modifications | HIGH | ❌ NEVER | Database protection |
| **Auth/RLS Protector** | Guards authentication and row-level security policies | HIGH | ❌ NEVER | Security boundary enforcement |
| **Edge Function Watcher** | Monitors serverless function changes | HIGH | ❌ NEVER | Production execution protection |
| **OpenRouter Gateway Guard** | Protects AI model integration | HIGH | ❌ NEVER | API integration safety |
| **Payment System Monitor** | Detects payment and subscription changes | HIGH | ❌ NEVER | Financial system protection |
| **Production Business Logic Detector** | Identifies core functionality modifications | HIGH | ❌ NEVER | Core business protection |
| **AION/MindOS/Web3 Protector** | Guards experimental system changes | HIGH | ❌ NEVER | Legacy/experimental system protection |
| **Route Restructuring Monitor** | Detects major routing architecture changes | HIGH | ❌ NEVER | System structure protection |
| **Source Folder/Package Renamer** | Monitors major codebase reorganization | HIGH | ❌ NEVER | Structural change protection |

### **Level 1: HUMAN APPROVAL REQUIRED**

**Significant Changes** - Requires manual Dean approval for safety:

#### 🟡 **Medium-Risk Agents**
| Agent Name | Purpose | Risk Level | Manual Approval Required | Scope |
|------------|---------|------------|-------------------------|--------|
| **UI Consistency Auditor** | Audits interface consistency across platforms | MEDIUM | ✅ YES | Visual design validation |
| **Component Refactoring Validator** | Validates component structure changes | MEDIUM | ✅ YES | Architecture refactoring |
| **Tenant Configuration Monitor** | Validates tenant-specific configurations | MEDIUM | ✅ YES | Configuration management |
| **Advisor Behavior Inspector** | Analyzes advisor interaction patterns | MEDIUM | ✅ YES | AI behavior analysis |
| **CRM/Client Logic Analyzer** | Analyzes customer relationship management | MEDIUM | ✅ YES | Business logic validation |
| **Business Dashboard Validator** | Validates dashboard data presentation | MEDIUM | ✅ YES | Data visualization |
| **Route Structure Checker** | Analyzes navigation structure changes | MEDIUM | ✅ YES | Route architecture |

### **Level 2: PROPOSAL ONLY**

**Low-Risk Changes** - Can be auto-proposed but require Dean approval for implementation:

#### 🟢 **Low-Risk Agents**
| Agent Name | Purpose | Risk Level | Auto-Proposal | Manual Implementation |
|------------|---------|------------|---------------|---------------------|
| **Documentation Analyzer** | Analyzes documentation completeness and clarity | LOW | ✅ YES | ✅ YES |
| **Ticket Quality Validator** | Validates ticket clarity and completeness | LOW | ✅ YES | ✅ YES |
| **Terminology Cleaner** | Identifies terminology inconsistencies | LOW | ✅ YES | ✅ YES |
| **Roadmap Analyzer** | Analyzes roadmap alignment and gaps | LOW | ✅ YES | ✅ YES |
| **Architecture Proposal Generator** | Generates architectural recommendations | LOW | ✅ YES | ✅ YES |

### **Level 3: FUTURE AUTO-APPROVE CANDIDATES**

**Automatable Improvements** - Can be auto-approved after Dean validates pipeline:

#### 🤖 **Automatable Agents**
| Agent Name | Purpose | Risk Level | Current Status | Future Status |
|------------|---------|------------|----------------|----------------|
| **Format Documentation Generator** | Auto-formats documentation to standards | LOW | ❌ CURRENTLY MANUAL | ✅ FUTURE AUTOMATION |
| **Checklist Section Adder** | Adds missing checklist sections to tickets | LOW | ❌ CURRENTLY MANUAL | ✅ FUTURE AUTOMATION |
| **Report Generator** | Automatically generates analysis reports | LOW | ❌ CURRENTLY MANUAL | ✅ FUTURE AUTOMATION |
| **Timestamp Updater** | Updates report generation timestamps | LOW | ❌ CURRENTLY MANUAL | ✅ FUTURE AUTOMATION |
| **Cross-Document Linker** | Adds internal documentation cross-links | LOW | ❌ CURRENTLY MANUAL | ✅ FUTURE AUTOMATION |

## Agent Registry Details

### **Vision Alignment Agent**

**Purpose**: Ensure alignment between platform vision and implementation

**Input Sources**:
- `docs/BIZOS_MASTER_CONTEXT.md` - Platform operating context
- `docs/BIZOS_NORTH_STAR.md` - Product vision and principles
- `docs/BIZOS_CURRENT_STATE_MAP.md` - Platform state assessment
- `docs/BIZOS_PLATFORM_TENANT_BRAND_AUDIT.md` - Brand separation analysis
- `tickets/*.md` - Implementation requirements

**Checks Performed**:
1. **Platform Identity Validation**
   - BizOS is consistently identified as platform
   - Exire Systema correctly labeled as tenant zero
   - No blind "BizOS rename" of Exire references
   - AION/MindOS/Web3 contexts not assumed inside core platform

2. **Vision-Implementation Matching**
   - Feature descriptions match platform purpose
   - Architecture aligns with multi-tenant design
   - Business primitives correctly classified as platform vs tenant

**Output Formats**:
- `reports/vision-alignment/vision-alignment-report-TIMESTAMP.md`
- JSON proposal format for integration systems
- Priority classification (HIGH/MEDIUM/LOW impact)

**Classification**:
- **Risk Level**: MEDIUM
- **Manual Approval**: YES
- **Auto-Proposal**: NO
- **Scope**: Vision and strategic alignment analysis

### **Security & Privacy Agent**

**Purpose**: Comprehensive security and privacy risk detection

**Input Sources**:
- Source code analysis (Secure scanning)
- Configuration files (`.env`, `vite.config`, etc.)
- Database schema and RLS policies
- Edge function code analysis
- OpenRouter integration verification

**Checks Performed**:
1. **Secrets Exposure Detection**
   - API keys in source code
   - Database credentials exposure
   - Authentication tokens in version control

2. **Authentication & Authorization**
   - RLS policy analysis
   - Role-based access control validation
   - Session management security

3. **External Service Security**
   - OpenRouter API key protection
   - External API integration security
   - Payment system data protection

**Output Formats**:
- `security-reports/security-scan-TIMESTAMP.md`
- JSON vulnerability classification
- Risk assessment (CRITICAL/MEDIUM/LOW)
- Dean approval workflow integration

**Classification**:
- **Risk Level**: HIGH
- **Manual Approval**: YES
- **Auto-Proposal**: NO
- **Scope**: Security scanning and vulnerability analysis

### **UI Guidelines Agent**

**Purpose**: Maintain UI consistency and quality standards

**Input Sources**:
- Source code (components, pages, layouts)
- Figma/Sketch design specifications (if available)
- Component library documentation
- User testing feedback

**Checks Performed**:
1. **Layout Consistency**
   - Mobile vs desktop layout alignment
   - Header, navigation, footer patterns
   - Drawer and panel behavior consistency

2. **Visual Design Quality**
   - Color scheme compliance (business OS palette)
   - Typography standards adherence
   - Spacing and alignment consistency

3. **Accessibility**
   - Touch target minimums
   - RTL (Hebrew) support validation
   - Screen reader compatibility
   - Keyboard navigation support

4. **Premium Quality**
   - Professional polish and finish
   - Business OS visual language
   - High-quality component implementations

**Output Formats**:
- `ui-reports/ui-consistency-TIMESTAMP.md`
- Priority-ordered ticket generation
- Before/after comparison documentation
- Manual QA recommendations

**Classification**:
- **Risk Level**: MEDIUM
- **Manual Approval**: YES
- **Auto-Proposal**: NO
- **Scope**: UI design and implementation validation

### **i18n / Translation Agent**

**Purpose**: Ensure complete language support across all UI elements

**Input Sources**:
- Source code string literals
- Translation key verification
- Locale configuration files
- UI component documentation

**Checks Performed**:
1. **Translation Coverage**
   - Missing translation keys detection
   - Hardcoded English/Hebrew/Spanish strings
   - Default language fallback analysis

2. **Language-Specific Considerations**
   - RTL vs LTR layout for Hebrew
   - Right-to-left text alignment
   - Bidirectional text support
   - Language-specific character encoding

3. **Cultural Adaptation**
   - Brand term localization
   - Context-appropriate translations
   - Regional formatting standards
   - Cultural sensitivity review

**Output Formats**:
- `i18n-reports/translation-coverage-TIMESTAMP.md`
- Missing key documentation
- Translation status by component
- Priority action items

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: Translation coverage and language support

### **System Integration Agent**

**Purpose**: Detect disconnected internal systems and missing connections

**Input Sources**:
- System configuration files
- API endpoint documentation
- Database schema relationships
- Business process flows

**Checks Performed**:
1. **Connection Validation**
   - Settings affecting actual behavior
   - Admin dashboard reflecting real state
   - Tenant configuration impacting UI/advisor
   - Language setting affecting UI display

2. **System Dependencies**
   - AI model settings integration
   - User/business settings to dashboard
   - Forms, buttons, actions connectivity
   - State management consistency

**Output Formats**:
- `integration-reports/integration-issues-TIMESTAMP.md`
- Broken dependency documentation
- Future integration tickets
- Risk assessment for connectivity

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: System connectivity and integration analysis

### **AI Systems Connectivity Agent**

**Purpose**: Comprehensive AI feature connectivity verification

**Input Sources**:
- AI model configuration files
- Advisor widget documentation
- Business Brain/router implementations
- AI service integrations

**Checks Performed**:
1. **AI Feature Inventory**
   - AI Article Builder functionality
   - AI content creation tools
   - Business advisor interactions
   - Model settings and configurations

2. **Model Integration**
   - Text generation model connections
   - Image generation model integration
   - Business context injection
   - Tenant-specific context awareness

**Output Formats**:
- `ai-reports/ai-connectivity-analysis-TIMESTAMP.md`
- AI feature inventory documentation
- Missing model connections report
- Tenant context requirements

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: AI system connectivity verification

### **Tenant Context Agent**

**Purpose**: Verify tenant-specific business context awareness

**Input Sources**:
- Tenant configuration files
- Business-specific implementations
- Advisor memory and context systems
- Language and cultural settings

**Checks Performed**:
1. **Business Context Validation**
   - Business name, type, industry identification
   - Language and cultural preferences
   - Advisor personality and communication style
   - Current workspace context preservation

2. **Context Injection**
   - TenantId and businessName propagation
   - Business service/offer catalog
   - Brand voice and identity maintenance
   - Current workspace context awareness

**Output Formats**:
- `tenant-reports/tenant-context-analysis-TIMESTAMP.md`
- Missing context documentation
- Hardcoded Exire/AION identification issues

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: Tenant business context validation

### **Missing Connections Agent**

**Purpose**: Identify unlinked or disconnected features

**Input Sources**:
- Route definitions vs component implementations
- Button actions and corresponding handlers
- Form submissions and backend processing
- Dashboard data sources and API connections

**Checks Performed**:
1. **Component Reachability**
   - Components not reachable from routes
   - Dead buttons and links
   - Unconnected form submissions

2. **Data Flow Validation**
   - Settings not affecting application behavior
   - Dashboard cards with static/fake data
   - Hooks without usage
   - Unused translation keys

**Output Formats**:
- `connectivity-reports/missing-connections-TIMESTAMP.md`
- Unreachable component documentation
- Feature wiring requirements
- Risk level assessment (HIGH/MEDIUM/LOW)

**Classification**:
- **Risk Level**: MEDIUM
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: Feature connectivity verification

### **Performance / Lightweight Agent**

**Purpose**: Identify optimization opportunities

**Input Sources**:
- Dependency analysis
- Component usage patterns
- Import/export dependencies
- Bundle analysis (if available)

**Checks Performed**:
1. **Unused Content**
   - Heavy components not being used
   - Duplicate component implementations
   - Unused imports in code files

2. **Legacy & Experimental**
   - Legacy modules in core shell
   - AION/Web3 dependencies in main bundle
   - Unnecessary framework dependencies

3. **Optimization Opportunities**
   - Lazy loading potential
   - Route-based code splitting
   - Bundle size reduction strategies

**Output Formats**:
- `performance-reports/lightweight-analysis-TIMESTAMP.md`
- Unused component documentation
- Optimization recommendations
- Risk level for each change (LOW/MEDIUM/HIGH)

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- **Auto-Proposal**: YES
- **Scope**: Performance optimization analysis

### **Regression Verification Agent**

**Purpose**: Automated post-change verification

**Input Sources**:
- Git diff analysis
- System state before changes
- Test coverage reports
- Browser validation results

**Checks Performed**:
1. **System Health**
   - Development server startup verification
   - Route accessibility testing
   - Mobile/desktop responsive design
   - i18n functionality validation
   - Advisor widget functionality

2. **Console & Error Analysis**
   - Console error detection
   - Vite overlay verification
   - JavaScript exception tracking
   - Network request errors

**Output Formats**:
- `regression-reports/post-deployment-verification-TIMESTAMP.md`
- Pre-change vs post-change comparison
- Failed test documentation
- Remediation recommendations

**Classification**:
- **Risk Level**: LOW
- **Manual Approval**: YES
- - **Auto-Proposal**: YES
- **Scope**: Post-deployment system validation

### **Diff Risk Reviewer**

**Purpose**: Review and classify git diff changes

**Input Sources**:
- Git diff analysis
- Change classification
- Risk assessment

**Checks Performed**:
1. **Change Classification**
   - Source code modifications
   - Configuration changes
   - Documentation updates
   - Generated file changes
   - Temporary file modifications

2. **Risk Assessment**
   - High-risk areas: auth, Edge Functions, payments, RLS, Supabase
   - Medium-risk areas: components, UI, tenant config, advisor behavior
   - Low-risk areas: docs, formatting, generated files

**Output Formats**:
- `review-reports/diff-risk-analysis-TIMESTAMP.md`
- Safe commit recommendation (YES/NO)
- Files requiring unstaging
- Files needing Dean review

**Classification**:
- **Risk Level**: MEDIUM
- **Manual Approval**: YES
- **Auto-Proposal**: NO
- **Scope**: Git diff analysis and risk classification

### **Proposal Review Board Agent**

**Purpose**: Consolidate analyzer outputs into Dean-approved proposals

**Input Sources**:
- All analyzer outputs
- Generated reports and tickets
- Risk classifications
- Approval requirements

**Output Formats**:
- `proposal-board/bizos-improvement-proposals-TIMESTAMP.md`
- Structured proposal format with:
  - Proposal ID
  - Title and description
  - Problem and impact analysis
  - Affected files and systems
  - Platform/tenant classification
  - Risk level assessment
  - Files not to touch
  - Acceptance criteria
  - Manual QA checklist
  - Recommended executor (Hermes/OpenCode/manual)
  - Approval requirements

**Classification**:
- **Risk Level**: MEDIUM
- **Manual Approval**: YES
- **Auto-Proposal**: NO
- **Scope**: Proposal consolidation and approval workflow

## Pipeline Integration Summary

### **Agent Execution Flow**
1. **Initialization**: Load BizOS_MASTER_CONTEXT.md for operational boundaries
2. **Scope Assessment**: Determine if changes are Track A (Platform) or Track B (UI/App)
3. **Safety Validation**: Confirm all safety protocols before execution
4. **Sequential Processing**: Execute agents in priority order
5. **Output Generation**: Create standardized reports for each agent
6. **Consolidation**: Aggregate outputs into unified proposal
7. **Dean Review**: Present consolidated proposals for approval

### **Agent Execution Order**
1. **Vision Alignment Agent** (HIGH priority)
2. **Security & Privacy Agent** (CRITICAL priority)
3. **UI Guidelines Agent** (MEDIUM priority)
4. **i18n/Translation Agent** (LOW priority)
5. **System Integration Agent** (LOW priority)
6. **AI Systems Connectivity Agent** (LOW priority)
7. **Tenant Context Agent** (LOW priority)
8. **Missing Connections Agent** (MEDIUM priority)
9. **Performance/Lightweight Agent** (LOW priority)
10. **Regression Verification Agent** (LOW priority)
11. **Diff Risk Reviewer** (MEDIUM priority)
12. **Proposal Review Board Agent** (HIGH priority)

### **Output Hierarchy**
- **Level 1**: Individual analyzer reports (component outputs)
- **Level 2**: Consolidated analysis summaries
- **Level 3**: Unified improvement proposals
- **Level 4**: Dean approval workflow documentation

### **Governance Compliance**
- **Analyzer-Only Default**: Focus on inspection and classification
- **One-Scope-at-a-Time**: Limited, focused changes only
- **Manual Validation**: Required for critical changes
- **Dean Approval**: Required for all commits and pushes
- **Git Rollback**: Primary change management approach

## Future Enhancements

### **Planned Agent Additions**
1. **Compliance Monitoring Agent** - Regulatory requirement tracking
2. **Cost Analysis Agent** - Performance and resource optimization
3. **User Experience Agent** - Usability and interaction design validation
4. **Infrastructure Monitoring Agent** - System health and performance monitoring
5. **Automated Fix Executor** - Safe, approved change implementation

### **Automation Roadmap**
1. **Phase 1**: Manual proposal generation and review
2. **Phase 2**: Semi-automated ticket creation and prioritization
3. **Phase 3**: Automated implementation for Level 3 proposals
4. **Phase 4**: Full pipeline automation with real-time monitoring

### **Quality Assurance Framework**
1. **Validation Requirements**
   - File existence verification (`test -f`)
   - Git status and diff verification
   - Application functionality validation
   - Type and format compliance
   - Safety protocol adherence

2. **Risk-Based Approach**
   - Level 0: Never auto-approve (strict protection)
   - Level 1: Manual approval required (medium risk)
   - Level 2: Proposal-only (low risk)
   - Level 3: Future automation (safe, routine tasks)

## Conclusion

The BizOS Pipeline Agent Registry establishes a **comprehensive framework** for safe, controlled platform improvement while protecting critical systems and maintaining operational boundaries.

**Core Principles**:
1. **Analyzer-First Approach**: Inspection and classification before changes
2. **Safety-First Protocol**: Protective boundaries around production systems
3. **Human Oversight**: Manual approval for all significant changes
4. **Gradual Automation**: Progressive introduction of automated capabilities
5. **Clear Documentation**: Comprehensive documentation for all processes

**This registry ensures that all BizOS improvements are**

✅ **Safety-compliant**
✅ **Well-documented**
✅ **Proposal-only**
✅ **Dean-approved**
✅ **Controlled and graded**