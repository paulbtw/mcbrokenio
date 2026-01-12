# McBroken AI Documentation

> Navigation hub for AI assistants working with the McBroken codebase.

## What is McBroken?

McBroken tracks McDonald's ice cream machine availability across US, EU, and AU regions. It's an open-source project inspired by mcbroken.com, built as a Turborepo monorepo with a Next.js frontend and AWS Lambda serverless backends.

## Quick Decision Tree

**What do you need to do?**

```
Starting a task?
├── Need to understand the project? → core/project-overview.md
├── Need tech stack details? → core/technology-stack.md
├── Need architecture understanding? → core/application-architecture.md
│
Working on code?
├── Setting up development? → development/development-workflow.md
├── Writing tests? → development/testing-patterns.md
├── Common implementation task? → development/common-tasks.md
│
Following patterns?
├── Database/Prisma work? → patterns/database-patterns.md
├── Frontend/React work? → patterns/frontend-patterns.md
├── Serverless/Lambda work? → patterns/serverless-patterns.md
├── General code style? → patterns/code-conventions.md
│
Maintaining docs?
└── Updating this documentation? → meta/maintaining-docs.md
```

## Documentation Structure

```
.ai/
├── README.md                    ← You are here (navigation hub)
├── core/                        ← Foundational knowledge
│   ├── project-overview.md      ← What McBroken does
│   ├── technology-stack.md      ← Exact versions & dependencies
│   ├── application-architecture.md ← System design & data flow
│   └── deployment-architecture.md  ← AWS/Vercel deployment
├── development/                 ← Day-to-day development
│   ├── development-workflow.md  ← Setup, commands, debugging
│   ├── testing-patterns.md      ← Testing approach
│   └── common-tasks.md          ← Frequent implementation tasks
├── patterns/                    ← Code patterns & conventions
│   ├── database-patterns.md     ← Prisma & PostgreSQL
│   ├── frontend-patterns.md     ← Next.js, React, TailwindCSS
│   ├── serverless-patterns.md   ← Lambda, Serverless Framework
│   └── code-conventions.md      ← Naming, imports, TypeScript
└── meta/
    └── maintaining-docs.md      ← How to update these docs
```

## Critical Information for AI Assistants

### Must-Know Facts

1. **Monorepo structure**: Use `pnpm --filter <package>` for package-specific commands
2. **Prisma client**: Always run `pnpm turbo run db:generate` after schema changes
3. **Node version**: Requires Node.js 22+ (see `.nvmrc`)
4. **Package manager**: pnpm only (not npm or yarn)

### Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Using Pages Router patterns | This is App Router (Next.js 15) |
| Forgetting Prisma generate | Run `db:generate` after schema changes |
| Using npm/yarn | Use pnpm exclusively |
| Hardcoding env values | Use `process.env.VAR_NAME` |
| Relative imports across packages | Use `@mcbroken/*` package imports |

### Quick Commands

```bash
# Development
pnpm install                     # Install dependencies
pnpm dev                         # Start all services
pnpm turbo run db:generate       # Generate Prisma client

# Quality
pnpm turbo run check-types       # TypeScript validation
pnpm turbo run lint              # ESLint
pnpm turbo run test              # Run tests
```

## Entry Points

| Tool | File | Location |
|------|------|----------|
| Claude Code | `CLAUDE.md` | Project root |
| Cursor | `.cursorrules` | Project root |
| General AI | `.ai/README.md` | This file |

## Single Source of Truth

Version numbers and technology specifications live in `core/technology-stack.md`. Do not duplicate version numbers elsewhere to prevent inconsistency.
