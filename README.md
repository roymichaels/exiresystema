# BizOS Platform Documentation

## Overview

**BizOS** is the **AI Business Operating System for all businesses**. This repository contains the **BizOS platform foundation** with **Exire Systema** as the first tenant.

### What BizOS IS
- **AI Business Operating System**: Platform for infinite businesses
- **Multi-Tenant Architecture**: Supports diverse business types
- **Business Primitives**: Reusable business components  
- **Contextual AI Advisors**: Intelligent business assistance

### What BizOS IS NOT
- Not just a coaching platform
- Not e-commerce only
- Not notes or knowledge management
- Not generic CRM

### Current Implementation
- **Exire Systema**: First and current live tenant
- **Legacy Architecture**: Being migrated to BizOS platform
- **Migration Status**: This repository is transitioning from Exire-specific implementation to generic BizOS platform with infinite tenant support.

## Getting Started

### For BizOS Platform Users
1. **Understand BizOS**: Platform for all businesses
2. **Multi-Tenant Awareness**: Exire Systema is one tenant among many
3. **Platform Features**: Use business primitives for any business type
4. **Configuration**: Customize platform for business-specific needs
5. **Extensions**: Build custom workflows using platform primitives
6. **Integration**: Connect to external systems through platform APIs
7. **Training**: Configure AI advisors with business-specific knowledge

### For Platform Developers
1. **Platform-First Design**: Design generic primitives for all businesses
2. **Tenant Isolation**: Separate platform from tenant implementations
3. **Component Reuse**: Create reusable BizOS business primitives
4. **Safety First**: Use analyzer-first development approach
5. **Clear Boundaries**: Document platform vs. tenant responsibilities

## Development Approach

### Current Reality
- **Repository**: Exire legacy architecture being migrated
- **Documentation**: Gradually transitioning to BizOS terminology
- **Interfaces**: May still reference Exire where appropriate

### BizOS Migration Strategy
1. **Phase 1**: Extract platform primitives and safety protocols
2. **Phase 2**: Update documentation to BizOS terminology
3. **Phase 3**: Separate platform vs. tenant branding
4. **Phase 4**: Establish tenant configuration systems
5. **Phase 5**: Create generic business primitives
6. **Phase 6**: Connect Advisor to business context
7. **Phase 7**: Archive or isolate legacy/experimental systems
8. **Phase 8**: Prepare multi-tenant SaaS structure

## Resources

### Documentation
- **BizOS Platform Model**: Technical architecture
- **BizOS Tenant Model**: Multi-tenant architecture  
- **BizOS Vision**: Platform strategy and philosophy
- **Hermes Pipeline**: Development workflow
- **Analyzer Registry**: Available analysis tools

### Development Tools
- **Enhanced Dev Repair Loop**: Safe auto-repair capabilities
- **Analyzer Scripts**: Comprehensive system analysis tools
- **Safety Protocols**: Robust governance for all changes

### Development

Install from the workspace root:

```sh
npm install
```

Run the app:

```sh
npm run dev
```

Build the app:

```sh
npm run build
```

App package only:

```sh
npm run dev:app
npm run build:app
```

## Environment

See [.env.example](c:\Users\roymichaels\Desktop\mindhacker-net\.env.example).

Core variables:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
VITE_WEB3AUTH_CLIENT_ID=
VITE_WEB3AUTH_NETWORK=
```

## Source Of Truth Docs

Start here:

- [management/VISION.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\VISION.md)
- [management/ARCHITECTURE.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\ARCHITECTURE.md)
- [management/API_CONTRACTS.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\API_CONTRACTS.md)
- [management/OPENCLAW_MIGRATION.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\OPENCLAW_MIGRATION.md)
- [management/DIRECTORY_ALIGNMENT.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\DIRECTORY_ALIGNMENT.md)