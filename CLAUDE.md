# CLAUDE.md - McBroken Project

This file provides context for Claude Code and AI assistants working with this codebase.

## Quick Reference

**What is it?** McDonald's ice cream machine availability tracker (Turborepo monorepo)

**Tech Stack**: Next.js 15 (App Router) + AWS Lambda + PostgreSQL + Prisma

**Full docs**: See `.ai/README.md` for navigation hub

## Decision Tree

```
What do you need?
├── Understand the project? → .ai/core/project-overview.md
├── Check versions? → .ai/core/technology-stack.md
├── Understand architecture? → .ai/core/application-architecture.md
├── Set up development? → .ai/development/development-workflow.md
├── Write database code? → .ai/patterns/database-patterns.md
├── Write frontend code? → .ai/patterns/frontend-patterns.md
├── Write serverless code? → .ai/patterns/serverless-patterns.md
└── Follow code style? → .ai/patterns/code-conventions.md
```

## Critical Rules

1. **Always run `pnpm turbo run db:generate` after Prisma schema changes**
2. **Use pnpm only** (not npm or yarn)
3. **Node.js 22+ required** (see `.nvmrc`)
4. **Use `@mcbroken/*` imports** across packages, not relative paths

## Quick Commands

```bash
pnpm install                     # Install dependencies
pnpm dev                         # Start all services
pnpm turbo run db:generate       # Generate Prisma client (REQUIRED after schema changes)
pnpm turbo run check-types       # TypeScript validation
pnpm turbo run lint              # ESLint
pnpm turbo run test              # Run tests
```

## Repository Structure

```
apps/
├── frontend/      # Next.js 15 (App Router) - @mcbroken/frosty
├── mcall/         # Serverless: EU region - @mcbroken/mcall
├── mcus/          # Serverless: US region - @mcbroken/mcus
└── mcau/          # Serverless: AU region - @mcbroken/mcau
packages/
├── database/      # Prisma client & schema - @mcbroken/db
├── mclogik/       # Shared business logic - @mcbroken/mclogik
├── eslint-config/
├── typescript-config/
└── serverless-config/
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/frontend/src/app/page.tsx` | Main frontend page |
| `apps/frontend/src/hooks/queries/useMcData.ts` | Data fetching hook |
| `packages/database/prisma/schema.prisma` | Database schema |
| `packages/mclogik/src/services/` | Core business logic |
| `apps/mc*/src/handlers/*.ts` | Lambda handlers |

## Database Models

**Pos** (Store): id, nationalStoreNumber, name, lat/lng, country, product status fields

**ItemStatus enum**: `AVAILABLE` | `PARTIAL_AVAILABLE` | `UNAVAILABLE` | `NOT_APPLICABLE` | `UNKNOWN`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using Pages Router patterns | Use App Router (Next.js 15) |
| Forgetting Prisma generate | Run `db:generate` after schema changes |
| Using npm/yarn | Use pnpm |
| Relative imports across packages | Use `@mcbroken/*` |

## Detailed Documentation

```
.ai/
├── README.md              ← Start here (navigation hub)
├── core/
│   ├── project-overview.md
│   ├── technology-stack.md    ← Single source of truth for versions
│   ├── application-architecture.md
│   └── deployment-architecture.md
├── development/
│   ├── development-workflow.md
│   ├── testing-patterns.md
│   └── common-tasks.md
├── patterns/
│   ├── database-patterns.md
│   ├── frontend-patterns.md
│   ├── serverless-patterns.md
│   └── code-conventions.md
└── meta/
    └── maintaining-docs.md
```
