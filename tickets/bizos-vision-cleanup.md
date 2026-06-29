# BIZOS Vision Cleanup - Future Tickets

## Overview
This document contains the cleanup tickets identified during the BizOS vision migration audit. These tickets address the separation of platform and tenant concerns, terminology updates, and documentation improvements needed to ensure clear distinction between BizOS (the platform) and Exire Systema (the first tenant).

## Current Status
- **Base Infrastructure**: ✅ Created (BizOS canonical documentation, analyzer scripts)
- **Audit Report**: ✅ Created (comprehensive vision migration audit)
- **Git Management**: ✅ Branch `bizos/docs-vision-migration` established
- **Analysis Complete**: ✅ Key documentation files identified for updates

## Future Cleanup Tickets

### 1. SEPARATE PLATFORM BRAND FROM TENANT BRAND
**Ticket ID**: BIZOS-VC-001
**Branch**: bizos/platform-tenant-branding
**Goal**: Create distinct brand identities for BizOS platform and Exire Systema tenant

**Context**:
- Current: "Exire Systema" used for both platform and tenant identity
- Need: Clear separation between BizOS platform (AI Business Operating System) and Exire Systema (first live tenant)

**Files Likely Involved**:
- `README.md` - Platform branding
- `AGENTS.md` - Documentation references
- `HERMES_PIPELINE.md` - Platform terminology
- All platform-facing documentation and UI strings
- Exire-specific branding materials
- Tenant configuration interfaces

**Files NOT to Touch**:
- Current source code logic and business rules
- Database schemas and migration files
- Supabase/auth configurations
- Edge Function implementations
- OpenRouter gateway configurations

**Risks**:
- Potential confusion during transition period
- Tenant-specific workflows may need re-documentation
- Brand management overhead for both entities

**Acceptance Criteria**:
1. ✓ BizOS platform brand established and documented
2. ✓ Exire Systema tenant brand clearly distinguished
3. ✓ Documentation reflects platform/tenant terminology correctly
4. ✓ No production code changes
5. ✓ All user-facing materials updated consistently

**OpenCode Prompt**:
"Create brand identity guidelines separating BizOS platform from Exire Systema tenant. Update documentation to use BizOS for platform references and Exire Systema for tenant-specific content. Ensure no code changes are made, only documentation and branding updates."

**Verification Checklist**:
- [ ] Brand identity files created/updated
- [ ] Documentation terms updated correctly
- [ ] No source code modifications
- [ ] User-facing materials consistent
- [ ] Review complete by designated reviewer

**Manual QA Checklist**:
- [ ] README.md reflects platform/tenant distinction
- [ ] AGENTS.md correctly describes BizOS vs Exire Systema
- [ ] HERMES_PIPELINE.md uses proper terminology
- [ ] All documentation follows naming guidelines
- [ ] User materials clearly identify platform vs tenant

---

### 2. ADD TENANT CONFIGURATION MODEL
**Ticket ID**: BIZOS-VC-002  
**Branch**: bizos/tenant-configuration
**Goal**: Implement tenant-specific configuration management system

**Context**:
- Current: Tenant settings mixed with platform configuration
- Need: Separate tenant configuration from platform settings for better management and security

**Files Likely Involved**:
- Configuration management scripts
- Tenant settings interfaces
- Platform configuration files
- Environment configuration files
- Database connection settings
- API endpoint configurations

**Files NOT to Touch**:
- Actual application business logic
- Core platform functionality
- Database schemas (schema changes are separate)
- Existing tenant implementations

**Risks**:
- Configuration complexity increase
- Potential breaking changes to existing setups
- Performance impact on configuration loading
- Security considerations for tenant isolation

**Acceptance Criteria**:
1. ✓ Tenant configuration system designed
2. ✓ Configuration isolation implemented
3. ✓ Existing functionality preserved
4. ✓ Configuration management tools created
5. ✓ Migration path for existing configurations

**OpenCode Prompt**:
"Design and implement tenant configuration management system that separates tenant-specific settings from platform configuration. Create a configuration framework that allows each tenant to maintain its own business rules, workflows, and settings while using shared platform infrastructure. Ensure backward compatibility with existing implementations."

**Verification Checklist**:
- [ ] Tenant configuration schema designed
- [ ] Configuration loading mechanism implemented
- [ ] Tenant isolation tested and working
- [ ] Existing functionality preserved
- [ ] Migration guide created

**Manual QA Checklist**:
- [ ] Configuration system documented
- [ ] Tenant isolation tested
- [ ] Existing configurations migrate correctly
- [ ] Performance benchmarks established
- [ ] Security reviewed and approved

---

### 3. AUDIT UI COPY FOR PLATFORM-VS-TENANT WORDING
**Ticket ID**: BIZOS-VC-003
**Branch**: bizos/ui-terminology-audit
**Goal**: Audit and update UI copy to distinguish between platform and tenant terminology

**Context**:
- Current: UI strings use generic terms that could be ambiguous
- Need: Clear distinction between platform features and tenant-specific functionality

**Files Likely Involved**:
- UI component strings and labels
- Navigation menu items
- Button labels and action text
- Error messages and validation copy
- Help documentation and tooltips
- User guidance materials

**Files NOT to Touch**:
- Actual UI component logic
- Navigation routing code
- Database content
- Actual business rules implementation
- Accessibility features

**Risks**:
- User confusion during transition
- Inconsistent terminology across UI
- Performance impact from copy changes
- Breaking changes to user workflows

**Acceptance Criteria**:
1. ✓ UI copy audit completed
2. ✓ Platform vs tenant terminology distinguished
3. ✓ User testing completed
4. ✓ All copy updated correctly
5. ✓ Quality assurance approved

**OpenCode Prompt**:
"Audit all UI strings to distinguish between platform features and tenant-specific functionality. Update copy to use BizOS terminology for platform-level features and maintain Exire Systema terminology only where tenant-specific. Ensure clear user understanding and maintain consistency across all UI elements."

**Verification Checklist**:
- [ ] UI copy inventory completed
- [ ] Platform/tenant terminology applied
- [ ] User testing results documented
- [ ] Copy updates implemented
- [ ] Quality review completed

**Manual QA Checklist**:
- [ ] Dashboard labels reviewed
- [ ] Navigation items updated
- [ ] Button text updated
- [ ] Error messages clarified
- [ ] Help documentation updated
- [ ] User testing completed

---

### 4. AUDIT ROUTES/FILES THAT HARDCODE EXIRE WHERE BIZOS-LEVEL NAMING IS NEEDED
**Ticket ID**: BIZOS-VC-004
**Branch**: bizos/naming-conventions-audit
**Goal**: Identify and fix hardcoded Exire references where BizOS-level naming is required

**Context**:
- Current: Some platform-level files still reference Exire specifically
- Need: Ensure platform-level components use BizOS terminology
- Risk: Platform functionality may be incorrectly branded as tenant-specific

**Files Likely Involved**:
- Platform configuration files
- API documentation
- Authentication systems
- Database access controls
- User management systems
- Framework and library configurations
- DevOps and deployment scripts
- CI/CD pipeline configurations

**Files NOT to Touch**:
- Actual application business logic
- User-facing branding and marketing materials
- Tenant-specific workflows and processes
- Customer communication content
- Accessibility features and content

**Risks**:
- Breaking existing functionality
- Incorrect platform branding
- User confusion and support issues
- Integration problems with external systems

**Acceptance Criteria**:
1. ✓ Hardcoded Exire references identified
2. ✓ BizOS-level naming implemented where appropriate
3. ✓ Backward compatibility maintained
4. ✓ System testing completed
5. ✓ Quality assurance approved

**OpenCode Prompt**:
"Audit all code and configuration files to identify hardcoded 'Exire' references that should use 'BizOS' at the platform level. Update these references to use appropriate BizOS terminology while maintaining tenant-specific references where they belong. Ensure no breaking changes to functionality." 

**Verification Checklist**:
- [ ] Code references inventory completed
- [ ] Platform-level renaming implemented
- [ ] Tenant-specific references preserved
- [ ] System tests passing
- [ ] Integration testing completed

**Manual QA Checklist**:
- [ ] Configuration files reviewed
- [ ] Code references audited
- [ ] Platform functionality verified
- [ ] User interfaces tested
- [ ] Performance benchmarks established

---

### 5. CREATE BUSINESS PRIMITIVE MAP
**Ticket ID**: BIZOS-VC-005
**Branch**: bizos/business-primitives-map
**Goal**: Create comprehensive map of business primitives and their tenant configurations

**Context**:
- Current: Business functionality scattered across codebase
- Need: Clear mapping of reusable business primitives and their tenant-specific variations
- Purpose: Foundation for platform tenant architecture

**Files Likely Involved**:
- Business process documentation
- Workflow definitions
- Primitive definitions
- Configuration templates
- API documentation
- Business rule specifications
- Tenant workflow examples
- System architecture docs

**Files NOT to Touch**:
- Actual implementation code
- Tenant-specific business logic
- User-facing application interfaces
- Testing infrastructure
- Deployment configurations

**Risks**:
- Incomplete primitive mapping
- Overlooking critical business functions
- Complex mapping process
- Maintenance challenges post-creation

**Acceptance Criteria**:
1. ✅ Business primitive categories identified
2. ✅ Primitive definitions documented
3. ✅ Tenant variations mapped
4. ✅ Dependencies and relationships established
5. ✅ Usage guidelines created

**OpenCode Prompt**:
"Create a comprehensive map of all business primitives within the current Exire Systema implementation. Document each primitive's function, tenant configurations, dependencies, and potential reusability across different business contexts. Establish standardized templates for tenant-specific adaptations." 

**Verification Checklist**:
- [ ] Primitive categories identified
- [ ] Definitions documented
- [ ] Tenant variations mapped
- [ ] Dependencies established
- [ ] Usage guidelines created

**Manual QA Checklist**:
- [ ] Admin dashboard reviewed
- [ ] Workflow templates verified
- [ ] Process documentation audited
- [ ] Configuration examples reviewed
- [ ] Integration points documented

---

### 6. CREATE ADVISOR CONTEXT MODEL
**Ticket ID**: BIZOS-VC-006
**Branch**: bizos/advisor-context-model
**Goal**: Design advisor context framework for platform-level AI functionality

**Context**:
- Current: Advisor functionality is tenant-specific and embedded in application
- Need: Platform-level advisor context model that supports diverse tenant needs
- Purpose: Foundation for contextual AI advisors across all BizOS tenants

**Files Likely Involved**:
- AI model documentation
- Advisor interaction logs
- Context management systems
- Business intelligence data
- Machine learning models
- API documentation
- Testing datasets
- System architecture docs

**Files NOT to Touch**:
- Actual AI model implementations
- Tenant-specific advisor memories
- User-facing advisor interfaces
- Application source code
- Deployment configurations

**Risks**:
- Incomplete context understanding
- Oversimplification of tenant-specific needs
- Technical implementation challenges
- Integration complexity

**Acceptance Criteria**:
1. ✓ Advisor context categories defined
2. ✓ Context management framework designed
3. ✅ Advisor interaction patterns documented
4. ✅ Tenant context variations mapped
5. ✅ Integration requirements established

**OpenCode Prompt**:
"Design a comprehensive advisor context framework that supports diverse tenant business contexts within the BizOS platform. Create context categories, management systems, and integration patterns that enable contextual AI advisors to understand and serve different business types effectively." 

**Verification Checklist**:
- [ ] Context categories defined
- [ ] Context management framework designed
- [ ] Advisor interaction patterns documented
- [ ] Tenant context variations mapped
- [ ] Integration requirements established

**Manual QA Checklist**:
- [ ] Advisor context model documented
- [ ] Context management system reviewed
- [ ] Integration requirements verified
- [ ] Tenant variations mapped
- [ ] Testing strategies developed

---

### 7. CREATE TENANT SETTINGS SCHEMA PROPOSAL
**Ticket ID**: BIZOS-VC-007
**Branch**: bizos/tenant-settings-schema
**Goal**: Design tenant-specific settings schema for platform configuration

**Context**:
- Current: Tenant settings mixed with platform configuration
- Need: Clear separation and standardization of tenant configuration
- Purpose: Foundation for tenant management and governance

**Files Likely Involved**:
- Database schema documentation
- Configuration management systems
- Tenant management interfaces
- API endpoint definitions
- Security and access control documentation
- Monitoring and logging systems
- Backup and recovery procedures
- Compliance and regulatory requirements

**Files NOT to Touch**:
- Actual database schemas
- Application configuration files
- User interface implementations
- Business logic code
- Testing infrastructure

**Risks**:
- Schema complexity and maintainability
- Performance impact on configuration loading
- Security considerations for tenant data
- Migration challenges from existing configurations

**Acceptance Criteria**:
1. ✓ Tenant settings categories identified
2. ✓ Schema structure designed
3. ✓ Security and access controls defined
4. ✓ Integration points established
5. ✓ Performance requirements documented

**OpenCode Prompt**:
"Design a comprehensive tenant settings schema that provides the foundation for tenant management in the BizOS platform. Define categories for business configuration, user management, security settings, integration requirements, and operational parameters while ensuring separation from platform-level configurations." 

**Verification Checklist**:
- [ ] Tenant settings categories identified
- [ ] Schema structure designed
- [ ] Security and access controls defined
- [ ] Integration points established
- [ ] Performance requirements documented

**Manual QA Checklist**:
- [ ] Tenant settings schema documented
- [ ] Security controls reviewed
- [ ] Integration requirements verified
- [ ] Performance requirements established
- [ ] Testing strategy developed

---

### 8. CREATE MIGRATION PLAN FOR MULTI-TENANT SAAS
**Ticket ID**: BIZOS-VC-008
**Branch**: bizos/multi-tenant-saas-migration
**Goal**: Develop comprehensive migration plan for evolving BizOS into multi-tenant SaaS platform

**Context**:
- Current: Single-tenant application with limited platform separation
- Need: Roadmap for transforming into scalable multi-tenant SaaS platform
- Purpose: Strategic plan for platform evolution and growth

**Files Likely Involved**:
- Architecture documentation
- Migration strategy documentation
- Technical implementation guides
- Operations planning documents
- Business case documentation
- Risk assessment reports
- Timeline and milestone planning
- Resource allocation plans

**Files NOT to Touch**:
- Actual application code
- Business logic implementation
- User interfaces
- Testing infrastructure
- Deployment configurations

**Risks**:
- Migration complexity and duration
- Operational disruptions during transition
- User adoption challenges
- Technical debt management
- Resource allocation and budget constraints

**Acceptance Criteria**:
1. ✓ Multi-tenant architecture requirements defined
2. ✓ Migration strategy documented
3. ✓ Timeline and milestones established
4. ✓ Risk assessment completed
5. ✓ Resource allocation planned

**OpenCode Prompt**:
"Develop a comprehensive migration plan for evolving from the current single-tenant application to a multi-tenant SaaS platform. This plan should include technical requirements, migration strategies, timeline, risk assessment, resource allocation, and operational considerations. The goal is to create a roadmap that enables scalable, secure, and efficient platform operations for infinite businesses." 

**Verification Checklist**:
- [ ] Multi-tenant architecture defined
- [ ] Migration strategy documented
- [ ] Timeline and milestones established
- [ ] Risk assessment completed
- [ ] Resource allocation planned

**Manual QA Checklist**:
- [ ] Migration roadmap documented
- [ ] Technical requirements reviewed
- [ ] Risk assessment completed
- [ ] Timeline validated
- [ ] Resource allocation approved

---

### 9. REVIEW OLD AION/MINIDOS REFERENCES AND DECIDE WHAT BELONGS IN BIZOS, WHAT IS LEGACY, AND WHAT SHOULD BE REMOVED
**Ticket ID**: BIZOS-VC-009
**Branch**: bizos/aion-mindos-reference-review
**Goal**: Comprehensive review of legacy AION/MindOS references and determine appropriate placement within BizOS platform

**Context**:
- Current: Many references to AION, MindOS, and related systems
- Need: Clear classification of what belongs in platform, what is legacy, and what should be removed
- Purpose: Clean up documentation and maintain clear platform identity

**Files Likely Involved**:
- Documentation and technical specifications
- Architecture and design documents
- Implementation notes and comments
- Legacy system references
- Migration documentation
- System integration guides
- Historical technical notes
- Development process documentation

**Files NOT to Touch**:
- Actual legacy code or systems
- Production application functionality
- User-facing application interfaces
- Business logic implementation

**Risks**:
- Incomplete reference classification
- Misplaced legacy systems
- Confusing documentation for new team members
- Maintaining outdated or irrelevant information

**Acceptance Criteria**:
1. ✓ All AION/MindOS references cataloged
2. ✓ Platform vs. legacy classification completed
3. ✓ Documentation cleanup recommendations
4. ✓ Migration strategy for legacy references
5. ✓ Team communication plan

**OpenCode Prompt**:
"Comprehensive audit of all AION, MindOS, and related legacy references. Classify each reference as Platform Component, Legacy System, Historical Documentation, or Should Be Removed. Create detailed categorization criteria and provide migration recommendations for each category. Ensure clear documentation for future team members." 

**Verification Checklist**:
- [ ] All AION/MindOS references cataloged
- [ ] Platform vs. legacy classification completed
- [ ] Documentation cleanup recommendations
- [ ] Migration strategy developed
- [ ] Team communication plan created

**Manual QA Checklist**:
- [ ] Reference inventory completed
- [ ] Classification criteria reviewed
- [ ] Documentation cleanup documented
- [ ] Migration strategy validated
- [ ] Team communication plan approved

---

### 10. AUDIT README AND DOCS AFTER CODEBASE STABILIZATION
**Ticket ID**: BIZOS-VC-010
**Branch**: bizos/documentation-audit-post-stabilization
**Goal**: Comprehensive audit and update of README and documentation after codebase stabilization

**Context**:
- Current: Documentation needs updates for BizOS platform
- Need: Final documentation cleanup and standardization after stabilization period
- Purpose: Ensure documentation accurately reflects platform capabilities and usage

**Files Likely Involved**:
- README.md documentation
- All markdown documentation files
- Technical documentation
- User guides and tutorials
- API documentation
- Configuration guides
- Installation and deployment documentation
- Contribution guidelines

**Files NOT to Touch**:
- Actual code implementations
- Business logic systems
- Application functionality
- User interface elements
- Database schemas

**Risks**:
- Incomplete documentation audit
- Outdated information persisting
- Inconsistent documentation standards
- Documentation not reflecting actual system capabilities

**Acceptance Criteria**:
1. ✓ README.md updated with BizOS information
2. ✓ Documentation audit completed
3. ✓ Standardized documentation format established
4. ✓ All documentation reflects platform capabilities
5. ✓ User experience improved

**OpenCode Prompt**:
"Perform comprehensive audit and update of all documentation including README.md, user guides, technical documentation, API documentation, configuration guides, and installation/deployment documentation. Ensure all documentation accurately reflects BizOS platform capabilities, terminology, and usage patterns. Establish standardized documentation formats and quality criteria." 

**Verification Checklist**:
- [ ] README.md updated completely
- [ ] Documentation audit completed
- [ ] Standardized format established
- [ ] Documentation quality reviewed
- [ ] User experience verified

**Manual QA Checklist**:
- [ ] README.md content validated
- [ ] Documentation completeness reviewed
- [ ] Terminology consistency verified
- [ ] User guides tested
- [ ] Quality assurance approved