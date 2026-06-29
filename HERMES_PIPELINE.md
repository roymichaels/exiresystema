# Hermes Development Pipeline

## Overview
Hermes is the intelligent agent orchestration system for Exire development. It follows an analyzer-first, fixer-second approach to ensure safe, focused changes.

## Core Workflow

### Phase 1: OBSERVATION
- System monitors code changes, errors, and repository state
- Captures logs, build outputs, and user interactions
- Identifies patterns and trends in development activity

### Phase 2: ANALYSIS
- Analyzers inspect code, logs, and repository structure
- Extract actionable insights and identify root causes
- Classify issues by severity and impact area

### Phase 3: RISK CLASSIFICATION
- Risk assessors evaluate potential impact of changes
- Score risk levels (LOW, MEDIUM, HIGH, CRITICAL)
- Identify dependencies and affected components

### Phase 4: TICKET CREATION
- Create structured tickets with clear acceptance criteria
- Define scope and boundaries
- Specify required tools and models
- Include verification checklists

### Phase 5: FIX ANALYSIS
- Fixers examine tickets and plan implementation
- Analyze code context and dependencies
- Verify safety and scope compliance
- Create minimal, focused changes

### Phase 6: VERIFICATION
- Execute safe checks (build, typecheck, lint)
- Perform browser-level verification
- Validate functionality and performance
- Review diffs and changes

### Phase 7: REPORTING
- Document findings and outcomes
- Report to Dean for approval
- Archive analysis for future reference
- Update knowledge base

## Agent Roles

### Analyzer Agents
- **Read-only by default**
- **Focus on inspection and classification**
- **Create structured tickets**
- **Never modify production code**

### Fixer Agents
- **Act within ticket scope**
- **Make minimal, focused changes**
- **Verify safety before implementation**
- **Document changes thoroughly**

## Safety Principles

1. **Quote all paths**: Repository paths contain spaces, always use quotes
2. **Browser reality**: Curl success ≠ working application
3. **One scope at a time**: No broad refactors or UI redesigns
4. **Manual validation**: Critical changes require manual verification
5. **Model policy**: Default cohere/north-mini-code:free, no Nemotron
6. **Rollback ready**: Git is the primary rollback mechanism

## Integration Points

- **Bun/Vite**: Build and development verification
- **OpenCode**: Code execution and modification
- **Git**: Version control and rollback
- **Hermes**: System orchestration and workflow management

## Quality Gates

1. **Analyzer Review**: All issues analyzed before fixes
2. **Risk Assessment**: All changes scored for safety impact
3. **Scope Verification**: Changes limited to ticket scope
4. **Verification**: Build, typecheck, and browser verification
5. **Dean Approval**: All commits, pushes, and risky changes approved

## Continuous Improvement

1. **Learning Loop**: Archive failed attempts and lessons learned
2. **Knowledge Base**: Maintain analyzer registry and documentation
3. **Feedback**: Incorporate user and stakeholder feedback
4. **Refinement**: Continuously improve analysis and classification

## Emergency Mode

In emergency situations:
- Use analyzer-first approach
- Implement minimal, focused fixes
- Prioritize system stability
- Document all changes thoroughly
- Seek Dean approval for critical changes

## BizOS Context

### Platform vs Tenant Focus
- **BizOS Platform**: AI Business Operating System for all businesses
- **Exire Systema**: First tenant within BizOS (Dean\'s business)
- **Analyzer-First**: System analysis before platform/tenant changes
- **Safety First**: Comprehensive validation for BizOS migration
- **Model Policy**: cohere/north-mini-code:free for Hermes and OpenCode

### Integration with BizOS Platform
- **Bun/Vite**: Core development and verification tools
- **OpenCode**: Safe code modifications within ticket scope
- **Git**: Primary rollback mechanism for all changes
- **Hermes**: System orchestration for BizOS evolution
- **Business Primitives**: Reusable components for infinite tenants

### Migration Safety Protocols
- **Read-Only Analyzers**: System inspection without production impact
- **Scope-Bounded Fixers**: Limited changes with manual validation
- **Clear Approval Process**: Dean oversight for critical BizOS changes
- **Git Rollback**: Full version control for all modifications
- **Browser Verification**: Validation beyond curl responses

### Quality and Governance
- **Analyzer Review**: Comprehensive analysis before implementation
- **Risk Classification**: Platform and tenant safety assessment
- **Scope Verification**: Ticket-specific change boundaries
- **Dean Approval**: High-level oversight for BizOS evolution
- **Learning Loop**: Archive lessons for future improvements