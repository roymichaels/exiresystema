# BizOS Platform/Tenant Brand Separation - Implementation Tickets

## Summary

This document contains the implementation tickets created as part of the **Platform/Tenant Brand Separation** analysis for the BizOS platform and Exire Systema tenant. These tickets represent future work items that should be implemented to properly separate platform-level BizOS references from tenant-specific Exire Systema references.

**NOTE:** This is analysis-only work. All tickets are for future implementation and require:
- Dean approval before any production changes
- Clear separation between platform and tenant work
- Priority-based implementation following the recommended change order

## Key Principles Applied

### Brand Separation Rules
- **BizOS** = Platform for all businesses (AI Business Operating System)
- **Exire Systema** = First/live tenant (Dean's own business)
- **No blind renaming** - preserve tenant identity
- **Platform-first approach** - extract tenant value into reusable platform components
- **Safe documentation updates** - distinguish platform vs tenant terminology

### Scope Boundaries
- **Phase 1 (This analysis)**: Documentation and terminology audit only
- **Phase 2+**: Implementation requires Dean approval and ticket scoping
- **Production systems**: No code changes without explicit ticket authorization

## Implementation Tickets

### T-001: Docs Terminology Cleanup
**Goal:** Update documentation where Exire is wrongly used as platform terminology

**Scope:** 
- Analysis of all .md files in docs/
- Correction of platform-level references to use "BizOS" instead of "Exire"
- Preservation of tenant-specific Exire Systema references
- Update master context and architectural documentation

**Files Likely Involved:**
- `docs/BIZOS_MASTER_CONTEXT.md`
- `docs/BIZOS_CURRENT_STATE_MAP.md`
- `docs/BIZOS_ARCHITECTURE_GUARDRAILS.md`
- `docs/BIZOS_NORTH_STAR.md`
- `docs/BIZOS_TERMINOLOGY.md`
- `docs/BIZOS_TENANT_MODEL.md`
- `docs/BIZOS_PLATFORM_MODEL.md`
- `docs/BIZOS_VISION.md`
- `docs/BIZOS_PRODUCT_PRINCIPLES.md`
- `docs/BIZOS_ROUTE_INVENTORY.md`
- `docs/BIZOS_MODULE_MAP.md`
- `docs/BIZOS_FEATURE_MATRIX.md`
- `docs/BIZOS_APP_INVENTORY.md`
- `docs/BIZOS_ORGANIZATION_PLAN.md`
- `docs/BIZOS_NEXT_ACTIONS.md`
- `docs/BIZOS_DECISION_LOG.md`
- `docs/BIZOS_ROADMAP.md`
- `docs/BIZOS_NORTH_STAR.md`

**Files NOT to Touch:**
- Core source code in `src/` (except i18n terminology)
- Production configuration files
- Database schema files
- Supabase/Edge Functions
- OpenRouter Gateway

**Risk:** HIGH - Brand confusion affects all stakeholders
**Acceptance Criteria:** All documentation clearly distinguishes platform vs tenant terminology
**Manual QA Checklist:** 
- [ ] Verify platform references use "BizOS"
- [ ] Verify tenant references use "Exire Systema"
- [ ] Verify ambiguous references are reviewed by Dean
- [ ] Verify no production source code changed

---

### T-002: UI Copy Audit
**Goal:** Map where UI says "EXIRE SYSTEMA" because it's tenant branding vs where it should later say "BizOS"

**Scope:**
- Comprehensive audit of all UI copy across the application
- Identify platform vs tenant messaging areas
- Create mapping for future terminology updates
- Establish tenant brand configuration templates

**Files Likely Involved:**
- `src/shell/Shell.tsx` (or similar shell components)
- `src/shellv2/ShellV2.tsx`
- `src/components/ui/` (various UI components)
- `src/i18n/` (translation keys)
- `src/routes/` (route labels and descriptions)
- `src/pages/` (page titles and headings)
- Documentation and help text

**Files NOT to Touch:**
- Core application logic
- Database relationships
- Authentication systems
- Payment processing
- External API integrations

**Risk:** HIGH - User experience impact and brand clarity
**Acceptance Criteria:** Clear UI copy audit with implementation roadmap
**Manual QA Checklist:**
- [ ] Map all current tenant branding areas
- [ ] Identify platform branding opportunities
- [ ] Create tenant brand config template
- [ ] Establish platform vs tenant copy guidelines
- [ ] Verify no tenant identity loss

---

### T-003: Tenant Brand Config Proposal
**Goal:** Propose a config object for tenant brand management

**Scope:**
- Design tenant-specific configuration object structure
- Define brand identity properties for individual tenants
- Establish platformName vs tenantName distinctions
- Create language and advisor name configuration

**Proposed Config Structure:**
```typescript
interface TenantBrandConfig {
  // Core Identity
  tenantId: string;              // Unique tenant identifier (e.g., "exire-systema")
  tenantName: string;            // Business name (e.g., "Exire Systema")
  platformName: string;          // Platform name (e.g., "BizOS")
  
  // Branding
  logoText: string;              // Display name for logos/branding
  primaryColor: string;           // Brand primary color
  secondaryColor: string;         // Brand secondary color
  
  // Language
  language: string;              // Default language (e.g., "en", "he", "es")
  
  // AI Advisor
  advisorName: string;           // Name of the AI advisor (e.g., "BizOS Advisor")
  advisorDescription: string;     // Advisor description
  
  // Business Context
  businessType: string;          // Type of business (e.g., "coaching", "therapy")
  industry: string;               // Industry classification
  
  // Platform Differentiation
  isPlatform: boolean;            // false for Exire Systema
  platformOwnership: string;      // Ownership type (e.g., "dean-owned", "platform-owned")
}
```

**Files Likely Involved:**
- `src/config/` (configuration files)
- `src/shell/` (platform shell components)
- `src/i18n/` (internationalization setup)
- `src/types/` (TypeScript type definitions)
- `docs/` (configuration documentation)

**Files NOT to Touch:**
- Supabase database schema
- Edge Functions implementations
- Authentication systems
- Payment processing logic

**Risk:** MEDIUM - Configuration changes affect multiple systems
**Acceptance Criteria:** Complete tenant brand config specification with implementation roadmap
**Manual QA Checklist:**
- [ ] Define all tenant brand properties
- [ ] Establish platform vs tenant naming conventions
- [ ] Create configuration validation rules
- [ ] Document configuration deployment process
- [ ] Verify backward compatibility requirements

---

### T-004: Platform Shell Naming Proposal
**Goal:** Decide what shell/header should display at platform level vs inside tenant workspace

**Scope:**
- Analyze current shell/header components
- Propose distinct naming conventions for platform vs tenant
- Establish visual hierarchy and user flow considerations
- Design tenant switching capabilities

**Current Shell Structure Analysis:**
- **Platform Level**: Should display "BizOS" for universal platform identity
- **Tenant Level**: Should display "Exire Systema" for specific business context
- **Navigation Elements**: Separate platform tools vs tenant workflows
- **Branding Elements**: Platform logo vs tenant-specific branding

**Files Likely Involved:**
- `src/shell/Shell.tsx` (main application shell)
- `src/shellv2/ShellV2.tsx` (advanced shell system)
- `src/shellv2/ShellV2Header.tsx` (header component)
- `src/components/` (navigation components)
- `src/layouts/` (layout components)

**Files NOT to Touch:**
- Core business logic
- Route protection systems
- Authentication mechanisms
- Database query logic

**Risk:** MEDIUM - UI changes impact user experience
**Acceptance Criteria:** Complete platform shell naming specification with wireframe recommendations
**Manual QA Checklist:**
- [ ] Define platform vs tenant shell naming
- [ ] Design user flow for context switching
- [ ] Create wireframe/mockup specifications
- [ ] Establish responsive design requirements
- [ ] Document shell component architecture

---

### T-005: Route Naming Review
**Goal:** Audit routes for platform vs tenant terms (no route changes yet)

**Scope:**
- Complete analysis of all application routes
- Classify routes as platform vs tenant specific
- Identify routes requiring tenant context switching
- Create route naming conventions roadmap

**Route Classification Framework:**

#### Platform Routes (Use "BizOS" terminology)
- `/admin/*` - Platform administration (possibly)
- `/*` - Main platform shell
- `/login` - Platform authentication
- `/public` - Platform marketing pages
- `/courses` - Platform educational content
- `/community` - Platform user forums
- `/pricing` - Platform pricing information

#### Tenant Routes (Use "Exire" terminology)
- `/coach/*` - Exire-specific coaching workflow
- `/business/*` - Exire business configuration
- `/sessions/*` - Exire journey tracking
- `/crm` - Exire CRM system
- `/therapist/*` - Exire therapy management

#### Admin Routes (Platform Management)
- `/admin/*` - Various admin sections (platform vs tenant admin?)

**Files Likely Involved:**
- `src/routes/` (route configuration files)
- `src/components/` (route components)
- `src/shell/` (route integration components)
- `src/i18n/` (route label translations)
- Documentation (route maps and inventories)

**Files NOT to Touch:**
- Actual route implementation files
- Database route mappings
- Authentication route configurations
- External service route integrations

**Risk:** LOW - Analysis only, no route changes
**Acceptance Criteria:** Complete route inventory with platform/tenant classification
**Manual QA Checklist:**
- [ ] Classify all current routes
- [ ] Identify platform vs tenant route boundaries
- [ ] Create tenant switching requirements
- [ ] Document route naming conventions
- [ ] Establish migration plan for route changes

---

### T-006: i18n Brand Key Proposal
**Goal:** Propose translation keys for platformName and tenantName (no translation rewrite yet)

**Scope:**
- Analyze current i18n structure and translation keys
- Propose new translation keys for platform/tenant branding
- Establish key naming conventions for brand terminology
- Create translation key inventory for future implementation

**Proposed Translation Key Patterns:**

#### Platform Keys (BizOS)
```
platformName: "BizOS"
platformDescription: "The AI Business Operating System for running a business"
platformWelcome: "Welcome to {{platformName}}"
platformBranding: "Powered by {{platformName}}"
```

#### Tenant Keys (Exire Systema)
```
tenantName: "Exire Systema"
tenantDescription: "Dean's AI coaching and subconscious workflow system"
tenantWelcome: "Welcome to {{tenantName}}"
tenantBranding: "Running {{tenantName}} on {{platformName}}"
```

#### Context Keys
```
brand.platformLabel: "Platform"
brand.tenantLabel: "Your Business"
brand.platformSwitcher.label: "Switch Platform"
brand.tenantSelector.label: "Select Your Business"
```

**Files Likely Involved:**
- `src/i18n/index.ts` (translation key exports)
- `src/i18n/translations/` (language-specific files)
- `src/components/` (i18n usage components)
- `src/shell/` (brand display components)
- `src/config/` (brand configuration)

**Files NOT to Touch:**
- Actual translation text in language files
- Core business logic translation dependencies
- Authentication message translations
- Payment system translations

**Risk:** LOW - Analysis only, setup for future implementation
**Acceptance Criteria:** Complete translation key proposal with key inventory
**Manual QA Checklist:**
- [ ] Analyze current i18n structure
- [ ] Propose new translation key patterns
- [ ] Create key naming conventions
- [ ] Document key usage guidelines
- [ ] Establish key implementation roadmap

---

### T-007: Code Rename Defer List
**Goal:** List all code identifiers that should NOT be renamed yet

**Scope:**
- Comprehensive inventory of code identifiers requiring preservation
- Analysis of renaming impact vs. benefit
- Establishment of renaming priority and timeline
- Creation of safe code identifier management guidelines

**CODE_IDENTIFIER_DO_NOT_TOUCH Categories:**

#### File Names (Preserved)
- `src/shellv2/` - Shell system directory
- `src/i18n/` - Internationalization directory
- `src/components/` - Component library
- `src/routes/` - Route system directory
- `src/pages/` - Page components
- `src/shellv2/` - Advanced navigation system
- `vite.config.ts` - Vite configuration
- `package.json` - Package configuration
- `README.md` - Project documentation

#### Component Names (Preserved)
- `AdvisorWidget` - AI advisor component
- `CoachLeadsTab` - Exire-specific coaching component
- `Shell`/`ShellV2` - Navigation shell components
- `AdvisorWidget` - Core advisor functionality
- `AdvisorBusinessContext` - Advisor context management

#### Route Names (Preserved)
- `/coach/*` - Exire coaching routes
- `/business/*` - Exire business routes
- `/sessions/*` - Exire journey routes
- `/crm` - Exire CRM routes

#### Database Names (Preserved)
- `exire_*` - Exire-specific database tables
- `tenant_*` - Tenant database structures
- `business_*` - Business logic tables

#### Import Paths (Preserved)
- `@/components/CoachLeadsTab`
- `@/components/AdvisoryWidget`
- `@/routes/coach`
- `@/i18n/translations/he.ts`

#### Configuration Keys (Preserved)
- `advisorName`
- `businessType`
- `tenantId`
- `platformId`

**Files Likely Involved:**
- All TypeScript/JavaScript source files
- Configuration files
- Database migrations
- Deployment scripts

**Files NOT to Touch:**
- Documentation files
- Analysis reports
- Test files
- Temporary files

**Risk:** HIGH - Breaking existing code identifiers could break functionality
**Acceptance Criteria:** Complete defer list with impact analysis and migration timeline
**Manual QA Checklist:**
- [ ] Inventory all code identifiers
- [ ] Assess rename impact vs. benefit
- [ ] Prioritize renaming by risk/benefit
- [ ] Create migration roadmap
- [ ] Document renaming protocols

---

## Implementation Priority Summary

### Phase 1: Foundation (This Quarter)
1. **T-001**: Docs terminology cleanup - Highest priority, analysis-only
2. **T-002**: UI copy audit - Foundation for user experience changes
3. **T-003**: Tenant brand config proposal - Core infrastructure for brand management

### Phase 2: UI/UX (Next Quarter)
4. **T-004**: Platform shell naming - Visual brand separation
5. **T-005**: Route naming review - Navigation terminology alignment
6. **T-006**: i18n brand key proposal - Translation infrastructure setup

### Phase 3: Technical Infrastructure (6+ Months)
7. **T-007**: Code rename defer list - Safe identifier management

## Risk Summary

### HIGH RISK (Dean Approval Required)
- **T-002**: UI changes impact user experience
- **T-004**: Shell/header redesign affects navigation
- **T-007**: Code identifier changes could break functionality

### MEDIUM RISK (Requires Planning)
- **T-003**: Configuration changes affect multiple systems
- **T-006**: i18n changes require coordinated deployment

### LOW RISK (Analysis Only)
- **T-001**: Documentation updates
- **T-005**: Route analysis (no changes yet)

## Implementation Guidelines

### Safety Requirements
1. **Dean Approval**: All tickets require explicit Dean approval before implementation
2. **Scope Limitation**: One ticket at a time, fully tested before moving to next
3. **Rollback Planning**: Each implementation must have clear rollback procedures
4. **Manual Validation**: Critical changes require manual verification beyond automated testing

### Testing Requirements
- **Unit Tests**: Core functionality tests for each change
- **Integration Tests**: Cross-component interaction tests
- **Manual QA**: User experience validation for UI changes
- **Browser Validation**: Actual application testing, not just server responsiveness

### Rollback Procedures
- **Git Revert**: Version control rollback capabilities
- **Manual Revert**: Step-by-step manual rollback instructions
- **Data Recovery**: Backup and restore procedures for critical data changes

## Conclusion

This ticket set establishes a comprehensive roadmap for the **Platform/Tenant Brand Separation** initiative. The tickets are structured to:

1. **Start safely** with analysis and documentation
2. **Establish foundation** before making UI changes
3. **Preserve existing functionality** while implementing brand separation
4. **Maintain clear separation** between platform and tenant work
5. **Ensure Dean oversight** for all production changes

**Critical Success Factors**:
- Maintain Exire Systema's tenant identity while enabling platform evolution
- Clear communication between platform and tenant stakeholders
- Gradual, coordinated implementation to minimize disruption
- Strong emphasis on safety and validation throughout the process

**Next Steps**:
- Review and approve tickets based on organizational priorities
- Begin implementation with T-001 (Docs terminology cleanup)
- Establish monitoring and validation procedures
- Plan timeline for Phase 1 completion and Phase 2 initiation