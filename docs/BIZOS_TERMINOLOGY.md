# BIZOS Terminology Documentation

## Core Concept Glossary

### BizOS (AI Business Operating System)
**Definition**: The foundational platform that provides the infrastructure for businesses to operate intelligently through contextual AI advisors and business automation.

**Characteristics**:
- AI-powered intelligent operations
- Multi-tenant architecture
- Business primitives library
- Context-aware automation
- Scalable to infinite businesses

**Usage Examples**:
- "BizOS provides the platform for business operations"
- "We're building on BizOS infrastructure"
- "BizOS tenant management system"

### Tenant
**Definition**: An individual business operating within the BizOS platform. Each tenant maintains its own data, configuration, and business context while sharing the platform's underlying infrastructure.

**Synonyms**: Workspace, Business Instance, Customer Account

**Usage Examples**:
- "Create a new tenant for the client"
- "Tenant-specific advisor memory"
- "Multi-tenant platform architecture"
- "Business tenant configuration"

### Workspace
**Definition**: User-facing term for tenant, emphasizing the collaborative and operational nature of the business environment within BizOS.

**Synonyms**: Tenant, Business Account, Workspace

**Usage Examples**:
- "Configure the workspace settings"
- "Workspace-specific advisor interactions"
- "Multiple users in the same workspace"
- "Workspace branding and customization"

### Exire Systema
**Definition**: The first and currently live tenant within BizOS, representing Dean's own business implementation and serving as the foundation for platform development and testing.

**Context**: Specific to the current implementation, not general platform terminology.

**Usage Examples**:
- "Exire Systema is using the new advisor features"
- "Migrate Exire Systema configuration"
- "Exire Systema tenant settings"
- "This tenant-specific workflow is from Exire Systema"

### Business Advisor
**Definition**: A contextual AI assistant that understands each tenant's unique business context, operations, and goals to provide intelligent recommendations and automation.

**Synonyms**: AI Advisor, Contextual Advisor, Business Intelligence

**Usage Examples**:
- "The Business Advisor suggests automation opportunities"
- "Advisor memory stores business patterns"
- "Multi-tenant advisor instances"
- "Advisor integration with business workflows"

### Business Memory
**Definition**: The accumulated knowledge and learning about a specific tenant's operations, patterns, preferences, and context that enables intelligent decision-making and recommendations.

**Usage Examples**:
- "Business Memory tracks customer interaction patterns"
- "Advisor leverages Business Memory for personalization"
- "Migrate Business Memory between tenants"
- "Business Memory consolidation"

### Business Primitive
**Definition**: A configurable, reusable component or workflow pattern that represents a common business function. Examples include lead management, task management, workflow automation, and reporting.

**Usage Examples**:
- "Implement the Lead Management primitive"
- "Business Primitives library"
- "Each tenant can customize Business Primitives"
- "Standard Business Primitive templates"

### Workflow
**Definition**: A structured sequence of business activities and decisions, often automated, that transforms inputs into outputs while following defined business rules and logic.

**Usage Examples**:
- "Create a new customer onboarding workflow"
- "Workflow automation within the platform"
- "Business workflow engine"
- "Workflow execution and monitoring"

### Automation
**Definition**: The use of technology to perform business tasks and processes with minimal human intervention, based on predefined rules and AI-driven decision-making.

**Usage Examples**:
- "Automated invoice generation"
- "Business process automation"
- "Intelligent automation features"
- "Automation engine capabilities"

### Insight
**Definition**: Data-driven observations and recommendations derived from business intelligence, analytics, and AI analysis that help businesses make informed decisions and optimize operations.

**Usage Examples**:
- "Growth insights from business analytics"
- "AI-generated business insights"
- "Insight dashboard for tenant operations"
- "Actionable business insights"

### Lead
**Definition**: A potential customer or business opportunity in the sales and relationship management process, typically tracked through the sales funnel.

**Usage Examples**:
- "Lead management system"
- "Convert leads to customers"
- "Lead scoring algorithm"
- "Tenant lead pipeline"

### Customer/Client
**Definition**: An established business relationship where goods, services, or solutions are provided on an ongoing basis.

**Usage Examples**:
- "Customer onboarding process"
- "Customer success management"
- "Client portal for tenant businesses"
- "Customer relationship management"

### Offer
**Definition**: A product, service, or solution package that a tenant makes available to their customers or clients, including pricing and terms.

**Usage Examples**:
- "Create new offer packages"
- "Offer management system"
- "Tenant offers and promotions"
- "Offer optimization features"

### Product/Service
**Definition**: The core deliverables or value propositions that a tenant provides to their customers, excluding financial transaction aspects.

**Usage Examples**:
- "Product catalog management"
- "Service delivery optimization"
- "Tenant products and services"
- "Product/Service inventory"

### Session/Appointment
**Definition**: A scheduled interaction, meeting, or consultation between a tenant's representative and a customer, client, or internal stakeholder.

**Usage Examples**:
- "Schedule business appointments"
- "Session booking system"
- "Tenant appointment management"
- "Virtual session features"

### Follow-up
**Definition**: Post-interaction communication or action taken to maintain relationships, ensure completion of commitments, or advance business processes.

**Usage Examples**:
- "Automated follow-up emails"
- "Follow-up task assignments"
- "Tenant follow-up workflows"
- "Relationship follow-up system"

### Task
**Definition**: A unit of work or responsibility within a business that needs to be completed, typically part of a larger workflow or process.

**Usage Examples**:
- "Task management system"
- "Assign tasks to team members"
- "Tenant task automation"
- "Task workflow optimization"

### Campaign
**Definition**: A coordinated marketing or business initiative with specific goals, timelines, and resources designed to achieve business objectives.

**Usage Examples**:
- "Marketing campaign creation"
- "Campaign performance tracking"
- "Tenant campaign management"
- "Campaign automation features"

### Funnel
**Definition**: A visual representation of the customer journey or sales process, showing the progression from initial contact through to conversion and beyond.

**Usage Examples**:
- "Sales funnel visualization"
- "Funnel analysis and optimization"
- "Tenant customer journey"
- "Conversion funnel management"

## Terminology Usage Guidelines

### Platform-Level Terms (Use BizOS)
- "Platform" → "BizOS"
- "Multi-tenant system" → "BizOS multi-tenant architecture"
- "Business operating system" → "BizOS AI business operating system"
- "Operating system" → "BizOS"

### Tenant-Specific Terms (Keep Exire Systema where appropriate)
- "Exire-specific workflows" → Keep "Exire" (tenant reference)
- "Dean’s business" → "Exire Systema"
- "Tenant branding" → "Tenant branding (Exire Systema example)"

### Ambiguous Cases (Context-Dependent)
- "Admin" → "Admin shell" (for platform) or "workspace admin" (for tenant)
- "Dashboard" → "Admin dashboard" (platform) or "workspace dashboard" (tenant)
- "User" → "Workspace user" (tenant) or "platform user" (system)

## Terminology Evolution Notes

### Current State
- Repository may still reference "Exire" for brand consistency
- Product documentation may transition gradually
- Code references may take longer to update

### Future Migration
- Platform-facing materials should use BizOS terminology
- Tenant-specific materials may retain Exire where appropriate
- Internal development should adopt platform terminology progressively

### Transition Strategy
1. Update platform documentation and branding first
2. Gradually migrate tenant references where appropriate
3. Maintain backward compatibility during transition
4. Create clear migration paths for users and stakeholders