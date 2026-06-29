# BizOS PIPELINE AGENT REGISTRY

## Overview

The BizOS Pipeline Agent Registry provides a **comprehensive catalog** of all analysis agents, tools, and their specific responsibilities within the BizOS continuous vision improvement pipeline. This registry establishes clear governance, safety protocols, and operational boundaries for all automated analysis activities while preserving Dean approval requirements for all production changes.

## Agent Registry Structure

The BizOS pipeline comprises **12 specialized agents** organized into three functional categories:

### **Vision & Analysis Agents**
- **Vision Alignment Agent** - Core strategic consistency validation
- **Security & Privacy Agent** - Comprehensive risk assessment
- **Performance / Lightweight Agent** - Optimization identification
- **Regression Verification Agent** - Post-change validation

### **Quality Assurance Agents**
- **UI Guidelines Agent** - Visual and interaction consistency
- **i18n / Translation Agent** - Multi-language compliance
- **System Integration Agent** - Internal system connectivity validation
- **Missing Connections Agent** - Feature completeness verification

### **AI & Context Agents**
- **AI Systems Connectivity Agent** - AI feature validation and wiring
- **Tenant Context Agent** - Business-specific context awareness
- **Diff Risk Reviewer** - Pre-commit change impact analysis
- **Proposal Review Board Agent** - Final recommendation validation

## Agent: Vision Alignment Agent

### Purpose
Validates that all BizOS components align with platform strategy, ensuring no blind renaming of Exire to BizOS, correct platform-tenant distinctions, and proper business operating system vision adherence.

### Inputs
- BizOS documentation (master context, north star, principles)
- Repo source code (routes, components, modules)
- UI implementation (headers, navigation, components)
- Tickets and feature requests

### Checks
1. **Platform vs Tenant Classification**
   - BizOS appears as platform (platform-level features)
   - Exire appears as tenant zero (business workspace)
   - No blind "Exire to BizOS rename" changes

2. **Strategy Alignment**
   - AION/MindOS/Web3/FM assumptions in core platform (requires approval)
   - Features fit business operating system vision

3. **Documentation Consistency**
   - Platform/tenant terminology consistency
   - Strategic document alignment

### Outputs
- Vision alignment report
- Contradictions identified
- Stale documentation flags
- Recommended tickets for clarification

### Risk Level: MEDIUM
- Strategic vision misalignment impacts core platform
- Requires understanding of platform business model

### Approval Mode: **REPORT ONLY**
- All findings reported
- Proposals require Dean approval
- No automatic fixes

### Never Auto-Fix Areas:
- Platform/tenant renaming
- Core business model changes
- Strategic vision adjustments

---

## Agent: Security & Privacy Agent

### Purpose
Comprehensive security assessment covering Supabase, auth, Edge Functions, OpenRouter gateway, payments, tenant data isolation, and all production business logic. Never auto-fix - always report for manual Dean review.

### Inputs
- All source code, configuration files
- Supabase schema and RLS policies
- Edge function implementations
- OpenRouter gateway configurations
- Payment processing logic

### Checks
1. **Exposed Secrets**
   - API keys in client-side code
   - Database credentials
   - Authentication tokens
   - Service role exposures

2. **Auth/RLS Risks**
   - Inadequate row-level security
   - Missing access controls
   - Session management vulnerabilities

3. **Edge Function Security**
   - Authentication and authorization
   - Input validation and sanitization
   - Error handling and logging

4. **Client/Server Boundaries**
   - Server-side API key exposure
   - Incorrect access controls
   - Data leakage risks

5. **Business Logic Protection**
   - Payments/subscription security
   - Tenant data separation
   - Admin access controls

### Outputs
- Security risk report
- Exposed secrets identification
- Missing security controls flags
- remediation recommendations

### Risk Level: CRITICAL
- Direct security vulnerabilities
- Data breach potential
- Production system compromise

### Approval Mode: **REPORT ONLY**
- All security findings reported immediately
- Dean approval required for any changes
- No automated security fixes

### Never Auto-Fix Areas:
- Exposed API keys
- Auth/RLS vulnerabilities
- Edge Function security issues
- Payment processing security
- Tenant data separation logic
- OpenRouter gateway security

---

## Agent: UI Guidelines Agent

### Purpose
Ensures UI consistency, mobile/desktop layout adherence, and premium business OS visual language throughout the platform while maintaining tenant-specific brand requirements.

### Inputs
- React component code
- CSS/styling implementations
- Mobile and desktop view specifications
- Hebrew RTL support requirements
- Business OS design standards

### Checks
1. **Header Management**
   - One-header rule compliance
   - No duplicate headers
   - Consistent header hierarchy
   - SEO-friendly header structure

2. **Layout Standards**
   - Mobile-first responsiveness
   - Desktop spacing consistency
   - Touch target minimums (44px)
   - Z-index organization

3. **Navigation Behavior**
   - Bottom navigation implementation
   - Drawer and chat widget behavior
   - Exit navigation requirements
   - Mobile navigation patterns

4. **Visual Language**
   - Premium business OS feeling
   - Color scheme adherence
   - Typography standards
   - Icon usage consistency

5. **RTL/Hebrew Support**
   - Proper RTL layout implementation
   - Text direction handling
   - Component RTL testing
   - Hebrew-specific UI requirements

### Outputs
- UI style guide updates
- Design violation reports
- Component improvement tickets
- Screenshots for manual QA
- Small UI refinement tickets

### Risk Level: LOW
- Visual consistency issues
- Minor display problems
- User experience improvements

### Approval Mode: **REPORT ONLY**
- All UI issues documented
- Dean approval for UI changes
- Quality assurance tickets required

### Never Auto-Fix Areas:
- Core navigation restructuring
- Major visual redesign
- Brand language changes

---

## Agent: i18n / Translation Agent

### Purpose
Ensures complete multi-language support (Hebrew, English, Spanish) for all UI changes while maintaining proper fallback mechanisms and avoiding hardcoded text.

### Inputs
- All UI text changes
- Translation key management
- Component text props
- Localization configuration
- Language switching implementation

### Checks
1. **Translation Key Management**
   - Missing translation keys
   - Key naming conventions
   - Fallback language implementation
   - Translation completeness

2. **Hardcoded Text Detection**
   - Hebrew/English/Spanish hardcoded text
   - Language-specific string literals
   - Static text components
   - Incomplete i18n implementation

3. **RTL/LTR Behavior**
   - Right-to-left language support
   - Text direction handling
   - Layout RTL compliance
   - Component RTL testing

4. **Brand Terms Classification**
   - Platform vs tenant brand terminology
   - Business-specific translations
   - Proper naming conventions
   - Brand consistency

5. **Translation Quality**
   - Proper fallbacks
   - Missing language support
   - Translation accuracy
   - Context-aware translations

### Outputs
- Translation completeness report
- Missing key identification
- Hardcoded text warnings
- i18n review tickets
- Language support improvements

### Risk Level: MEDIUM
- User experience degradation
- Inconsistent international behavior
- Navigation accessibility issues

### Approval Mode: **REPORT ONLY**
- All translation issues documented
- Manual QA for i18n changes
- Dean approval for language modifications

### Never Auto-Fix Areas:
- Hardcoded UI text
- Missing translation keys
- Incomplete language support
- Brand term classification changes
---

## Agent: System Integration Agent

### Purpose
Ensures all internal systems are properly connected and functional, validating that settings affect behavior, configurations propagate correctly, and business logic integrates seamlessly.

### Inputs
- System settings and configuration files
- Component integration patterns
- API endpoints and routes
- User interface connections
- Dashboard data sources

### Checks
1. **Settings to Behavior**
   - System settings configuration
   - Behavior implementation validation
   - Configuration propagation
   - Setting persistence

2. **Tenant Configuration Integration**
   - UI configuration effects
   - Advisor configuration integration
   - Content generation configuration
   - Business type configuration

3. **Dashboard Integration**
   - Real data reflection
   - Current state visualization
   - Live updates and refresh
   - Empty data state handling

4. **Language Integration**
   - UI language changes propagation
   - System language settings
   - Internationalization testing
   - Regional compliance

5. **AI Tool Integration**
   - Model settings configuration
   - AI tool behavior validation
   - Context injection testing
   - Performance optimization

### Outputs
- Disconnected system reports
- Integration gap identification
- Missing wiring documentation
- Future integration tickets
- System completeness validation

### Risk Level: HIGH
- System functionality depends on proper integration
- Data consistency risks
- Performance degradation

### Approval Mode: **REPORT ONLY**
- All integration issues documented
- System connectivity validation
- Dean approval for integration changes

### Never Auto-Fix Areas:
- Core system wiring
- Database relationships
- API endpoint configuration
- Business logic connections
---

## Agent: AI Systems Connectivity Agent

### Purpose
Validates all AI-powered features, ensuring proper model configuration, tenant context injection, and system integration while preventing hardcoded AION/Exire/BizOS references.

### Inputs
- AI article builder implementation
- Advisor widget code
- Business brain model router
- Text generation model configuration
- Image generation model settings
- AI tool configurations

### Checks
1. **AI Article Builder**
   - Tenant context requirement
   - Marketing reference correctness
   - Hardcoded AION/Exire checks
   - Content generation validation

2. **Advisor Widget**
   - AI model connection validation
   - Tenant context injection
   - Advisor personality configuration
   - AI advisor responsiveness

3. **Business Brain / Model Router**
   - Text model connection
   - Image model connection
   - Tenant/business context injection
   - Prompt source validation

4. **System Integration**
   - Settings integration
   - Language support validation
   - Model settings application
   - AI tool configuration

### Outputs
- AI feature inventory
- Broken AI wiring identification
- Missing text/image model reports
- Missing tenant context detection
- Recommended wiring tickets
- Hardcoded reference warnings

### Risk Level: HIGH
- AI functionality core to platform
- Tenant context awareness critical
- Model integration failures

### Approval Mode: **REPORT ONLY**
- All AI connectivity issues documented
- Dean approval for AI changes
- Manual validation required

### Never Auto-Fix Areas:
- AI model configuration
- Tenant context injection
- AI tool wiring
- Hardcoded business references

---

## Agent: Tenant Context Agent

### Purpose
Ensures every business-aware feature correctly identifies and respects the current tenant/workspace context, preventing hardcoded Exire/AION references where BizOS platform should be used.

### Inputs
- All component and route implementations
- Tenant configuration files
- Business context objects
- Language and region settings
- Advisor personality configurations
n
### Checks
1. **Tenant Context Detection**
   - tenantId usage in components
   - businessName presence validation
   - businessType configuration
   - brand voice identification

2. **Context Injection**
   - tenantId injection in API calls
   - businessName propagation
   - businessType application
   - context validation checks

3. **Hardcoded Reference Detection**
   - Hardcoded Exire workspace references
   - Hardcoded AION/MindOS references
   - Exire-specific business logic
   - Missing tenant configuration

4. **Context Configuration**
   - language settings validation
   - advisor personality requirements
   - offers/services validation
   - target audience specification

### Outputs
- Missing tenant context reports
- Hardcoded reference warnings
- tenant config requirements
- business-specific implementation tickets
- context injection validation

### Risk Level: HIGH
- Tenant feature isolation critical
- Data leakage risks
- business logic contamination

### Approval Mode: **REPORT ONLY**
- All context issues documented
- Dean approval for tenant changes
- Manual review required

### Never Auto-Fix Areas:
- Core tenant identification
- business-specific logic
- tenant configuration changes
- context injection mechanisms
---

## Agent: Missing Connections Agent

### Purpose
Identifies features that exist but are not reachable from routes or accessible through the user interface, ensuring complete functionality and user experience.

### Inputs
- Component dependency analysis
- Route configuration files
- Button and action implementations
- Form and submission logic
- Dashboard and data integration

### Checks
1. **Route Connectivity**
   - Components reachable from routes
   - Navigation accessibility
   - Route component mapping
   - Access control validation

2. **Interactive Element Validation**
   - Dead buttons detection
   - Non-functional forms
   - Missing submit actions
   - Incomplete user flows

3. **Data Integration**
   - Settings consumption
   - dashboard data sources
   - Real-time data updates
   - Data persistence validation

4. **Hook Usage**
   - Used hooks validation
   - Unused component detection
   - Dependency analysis
   - Bundle optimization

5. **Dashboard Component Validation**
   - Fake/static data detection
   - Real data integration
   - Current state reflection
   - Data accuracy validation

6. **AI Function Wiring**
   - AI call integration
   - Prompt injection validation
   - Response handling
   - Error integration

### Outputs
- Missing connection reports
- Feature wiring tickets
- Component accessibility validation
- User flow improvements
- Performance optimization opportunities

### Risk Level: MEDIUM
- User experience gaps
- Feature availability issues
- Incomplete functionality

### Approval Mode: **REPORT ONLY**
- All connection issues documented
- Feature completeness validation
- Dean approval for connectivity changes

### Never Auto-Fix Areas:
- Core route configuration
- Component accessibility
- Dashboard data integration
- User flow additions
---

## Agent: Performance / Lightweight Agent

### Purpose
Identifies opportunities to make the application lighter and simpler while maintaining functionality, focusing on optimization and unnecessary code removal.

### Inputs
- Component usage analysis
- Import statements and dependencies
- JavaScript bundle size indicators
- Load time performance metrics
- Network resource consumption

### Checks
1. **Component Optimization**
   - Unused heavy components
   - Duplicate component implementations
   - Unused imports and dependencies
   - Component complexity analysis

2. **Module Loading**
   - Legacy modules loaded in core shell
   - Unnecessary early loading
   - Bundle size optimization opportunities
   - Lazy loading identification

3. **Bundle Management**
   - Code splitting opportunities
   - Module loading patterns
   - Resource consumption analysis
   - Performance impact assessment

4. **AION/Web3 Loading**
   - Early Web3 integration check
   - AION module loading timing
   - Performance impact of legacy systems
   - Optimization recommendations

### Outputs
- Lightweight improvement proposals
- Risk level assessment
- Safe cleanup tickets
- Performance optimization opportunities
- Bundle size reduction strategies

### Risk Level: LOW
- Optimization improvements
- Performance enhancement
- Bundle size reduction

### Approval Mode: **REPORT ONLY**
- All optimization opportunities documented
- Risk assessment for changes
- Dean approval for performance modifications

### Never Auto-Fix Areas:
- Core functionality
- User interface components
- Essential business logic
---

## Agent: Regression Verification Agent

### Purpose
Runs comprehensive checks after changes to ensure all core functionality remains intact, covering development server, application loading, responsive design, and i18n support.

### Inputs
- Application code changes
- Configuration modifications
- Route updates
- Component dependencies
- Integration changes

### Checks
1. **Development Environment**
   - Dev server boots successfully
   - No critical startup errors
   - Environment configuration
   - Dependency validation

2. **Application Loading**
   - Core route loads correctly
   - Components render properly
   - Initial data loading
   - Error handling validation

3. **Responsive Design**
   - Mobile width smoke test
   - Desktop width validation
   - Layout consistency
   - Component alignment

4. **Internationalization**
   - i18n smoke test
   - Translation loading
   - RTL/LTR validation
   - Locale support

5. **Advisor Integration**
   - Advisor widget smoke test
   - AI advisor functionality
   - Context injection validation
   - Advisor response handling

### Outputs
- Post-change verification report
- Functional integrity validation
- Performance smoke test results
- Internationalization validation
- Advisor integration status

### Risk Level: MEDIUM
- Change impact assessment
- Functional regression detection
- User experience validation

### Approval Mode: **REPORT ONLY**
- All regression checks documented
- Change impact analysis
- Dean approval for changes requiring validation

### Never Auto-Fix Areas:
- Core application loading
- User interface functionality
- Internationalization integration
---

## Agent: Diff Risk Reviewer

### Purpose
Analyzes current git diff before any commit to identify source code changes, configuration modifications, risky files, and potential deployment impacts.

### Inputs
- Git diff data
- Staged file changes
- Commit history
- File classifications

### Checks
1. **Source File Changes**
   - Source files modified
   - Configuration changes
   - Documentation updates
   - Generated files consideration

2. **Risk Assessment**
   - Risky areas changed
   - Deleted files impact
   - Generated files staged
   - Reports/temp files presence

3. **File Classification**
   - Production source files changed
   - Configuration modifications
   - Documentation updates
   - Generated/report files

### Outputs
- Safe to commit assessment
- Files to unstage recommendations
- Files needing Dean review
- Risk categorization
- Change impact analysis

### Risk Level: CRITICAL
- Production deployment risk
- File system integrity
- Code quality control

### Approval Mode: **REPORT ONLY**
- All risk assessments documented
- Manual review for risky changes
- Dean approval for high-risk files

### Never Auto-Fix Areas:
- Source file modifications
- Configuration changes
- Deployment-impacting changes
---

## Agent: Proposal Review Board Agent

### Purpose
Collects all analyzer outputs and transforms them into structured proposals that Dean can review, approve, or reject for implementation.

### Inputs
- All analyzer reports and findings
- Risk assessments from multiple agents
- Change impact analysis
- Implementation recommendations

### Proposal Requirements
Each proposal must include:

1. **Proposal ID**
   - Unique identifier
   - Sequential number
   - Category classification

2. **Title**
   - Clear problem statement
   - Impact description
   - Action recommendation

3. **Problem**
   - Issue identification
   - Business impact
   - Risk assessment

4. **Why It Matters**
   - Strategic importance
   - User experience impact
   - Platform alignment

5. **Affected Files**
   - Complete file list
   - Change scope
   - Implementation details

6. **Systems Affected**
   - Application systems impacted
   - Component connections
   - Integration requirements

7. **Platform/Tenant Classification**
   - Platform-level change
   - Tenant-specific modification
   - Both impact assessment

8. **Risk Level**
   - Threat assessment
   - Impact severity
   - Dependency complexity

9. **Files Not to Touch**
   - Protected paths list
   - Safety boundaries
   - Exclusion criteria

10. **Acceptance Criteria**
    - Success conditions
    - Verification steps
    - Quality requirements

11. **Manual QA Checklist**
    - Testing procedures
    - Validation requirements
    - Quality gates

12. **Recommended Executor**
    - Hermes agent
    - OpenCode execution
    - Manual implementation

13. **Approval Required**
    - Yes/No classification
    - Dean approval level
    - Risk justification

### Outputs
- Structured proposal documentation
- Prioritized change recommendations
- Dean approval workflow
- Implementation tracking
- Quality assurance requirements

### Risk Level: MEDIUM
- Change implementation risk
- Approval process complexity
- Implementation tracking

### Approval Mode: **REPORT ONLY**
- All proposals structured
- Dean review and approval
- Implementation tracking

### Never Auto-Fix Areas:
- Source code modifications
- Production changes
- Strategic business logic
