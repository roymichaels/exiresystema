# BIZOS Platform/Tenant Brand Separation Audit

## Executive Summary

This audit analyzes terminology and references across the Exire repository to establish clear separation between **BizOS (the platform)** and **Exire Systema (tenant zero)**. The goal is to identify, classify, and recommend changes for platform-level references that should use "BizOS" terminology versus tenant-specific references that should remain "Exire." 

## Rules

### Core Brand Guidelines
- **BizOS** = AI Business Operating System platform for all businesses
- **Exire Systema** = First and current live tenant within BizOS (Dean's own business)
- **Do NOT blindly rename Exire to BizOS** - This would break tenant identity
- **Preserve tenant-specific branding** where appropriate
- **Update platform-level references** to use "BizOS" terminology

### Classification Framework

#### PLATFORM_SHOULD_BE_BIZOS
- References to the platform, product, architecture, generic app, SaaS, business OS, reusable systems, or multi-tenant infrastructure

#### TENANT_SHOULD_REMAIN_EXIRE  
- References to Dean's own business, Exire Systema tenant, Exire coaching/subconscious workflows, tenant-specific branding, tenant-specific data, or current live workspace

#### AMBIGUOUS_NEEDS_DEAN_REVIEW
- References that could be platform or tenant and require Dean's decision

#### CODE_IDENTIFIER_DO_NOT_TOUCH
- File names, component names, route names, database names, imports, existing code identifiers

#### LEGACY_REFERENCE
- Old AION/MindOS/Web3/FM/old product references for future review

## Analysis Results Summary

### Files Analyzed
- ✅ `docs/BIZOS_MASTER_CONTEXT.md` (Read First)
- ✅ `docs/BIZOS_AGENT_OPERATING_MANUAL.md` (Read First)
- ✅ `docs/BIZOS_ARCHITECTURE_GUARDRAILS.md`
- ✅ `docs/BIZOS_NORTH_STAR.md`
- ✅ `docs/BIZOS_CURRENT_STATE_MAP.md`
- ✅ `AGENTS.md`

### References Found
Based on the master context analysis, the following terminology patterns were identified:

#### Platform-Level References (SHOULD BE BIZOS)
- **Core Product Identity**: "BizOS is the AI operating system for running a business"
- **Platform Architecture**: "Platform layer", "Tenant workspace layer", "Business primitives"
- **Multi-Tenant Infrastructure**: "Multi-tenant architecture", "Platform vs. Tenant distinction"
- **Business Primitives**: "Reusable building blocks for business operations"
- **Contextual AI Advisors**: AI that understands each business's unique context

#### Tenant-Specific References (SHOULD REMAIN EXIRE)
- **Current Live Tenant**: "Exire Systema", "first and currently live tenant"
- **Business Implementation**: "Dean's own business implementation"
- **Industry-Specific Workflows**: "Coaching interface", "Therapy services", "Business creation wizard"
- **Tenant Branding**: Exire-specific components and workflows

#### Ambiguous References (NEEDS DEAN REVIEW)
- **Current Reality statements**: "Repository still named 'exire' for workspace"
- **Application presenting as**: "Currently presents primarily as Exire Systema to end users"

## Specific Areas for Review

### Documentation Changes

#### UI Copy Areas (Future Review)
- Areas where application presents as "Exire Systema" to end users
- Tenant branding vs. platform messaging

#### Docs Areas (Safe to Update)
- ✅ Platform documentation already using BizOS terminology
- ✅ Architecture guardrails and safety protocols
- ✅ Agent operating guidelines

#### Source Areas (Future Code Tickets)
- **T-001**: UI copy audit for platform vs tenant terminology
- **T-002**: Route naming review for platform vs tenant consistency
- **T-003**: i18n brand key proposal for BizOS/tenantName terms

## Recommended Change Order

### Phase 1: Documentation Standardization (This Quarter)
1. **Update master context files** - Ensure consistent BizOS terminology
2. **Create platform tenant brand audit** - This document
3. **Implement tenant brand config** - Proposed config object for tenant branding

### Phase 2: UI/UX Review (Next Quarter)  
1. **Platform shell naming** - Decide shell/header display hierarchy
2. **UI copy audit** - Map where Exire Systema branding is appropriate vs platform
3. **Tenant brand configuration** - Implement tenant-specific display names

### Phase 3: Technical Infrastructure (6+ Months)
1. **Route naming review** - Audit routes for platform/tenant terminology alignment
2. **i18n brand key proposal** - Create translation keys for platformName/tenantName
3. **Code identifier review** - List all code identifiers that should NOT be renamed

## Risks and Considerations

### Primary Risks
1. **Tenant Identity Loss**: Blind renaming could erase Exire Systema's unique business identity
2. **Brand Confusion**: Inconsistent terminology between platform and tenant
3. **User Experience Impact**: Users currently expect "Exire Systema" branding

### Mitigation Strategies
1. **Clear Distinction**: Maintain clear separation between platform and tenant branding
2. **Gradual Migration**: Update platform references gradually, tenant-first approach
3. **Dean Oversight**: Maintain human review for ambiguous references

## Implementation Guidelines

### What Can Be Done Now
- ✅ Create clear documentation of platform vs tenant distinctions
- ✅ Establish brand terminology guidelines
- ✅ Create ticket structure for future implementation
- ✅ Begin inventory of platform references requiring BizOS updates

### What Requires Dean Approval
- Any tenant-specific branding changes
- Large-scale UI redesign affecting both platform and tenant
- Route or component renaming that impacts production systems

## Next Immediate Actions

1. **T-001 Docs terminology cleanup** - Update documentation where Exire is wrongly used as platform
2. **T-002 UI copy audit** - Map where UI says "EXIRE SYSTEMA" because it's tenant branding
3. **T-003 Tenant brand config proposal** - Propose config object for tenant brand management
4. **T-004 Platform shell naming proposal** - Decide shell/header display hierarchy
5. **T-005 Route naming review** - Audit routes for platform vs tenant terminology alignment
6. **T-006 i18n brand key proposal** - Create translation keys for platformName and tenantName
7. **T-007 Code rename defer list** - List all code identifiers that should NOT be renamed yet

## Conclusion

The analysis establishes a clear foundation for separating platform-level BizOS references from tenant-specific Exire Systema references. The key insight is that **Exire Systema serves as the foundation for platform extraction** - its business logic and workflows demonstrate the value of making business primitives reusable across the platform.

**Critical Success Factor**: Maintain Exire Systema's tenant identity while extracting its value into reusable BizOS components and terminology.