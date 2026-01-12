# Development Workflow

## Initial Setup

### Prerequisites

Check `core/technology-stack.md` for exact versions.

```bash
# Verify Node.js version
node --version  # Should be 22.11.0+

# Verify pnpm
pnpm --version  # Should be 10.x
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd kingston

# Install dependencies
pnpm install

# Copy environment template
cp .env.dist .env
# Edit .env with your values
```

### Database Setup

```bash
# Start local PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Generate Prisma client
pnpm turbo run db:generate

# Run migrations
pnpm turbo run db:migrate
```

### Verify Setup

```bash
pnpm turbo run check-types
pnpm turbo run lint
pnpm turbo run test
```

## Development Commands

### Full Stack

```bash
# Start everything
pnpm dev
```

This runs:
- Frontend at http://localhost:3000
- Serverless offline (if configured)

### Individual Apps

```bash
# Frontend only
pnpm --filter @mcbroken/frosty dev

# Specific serverless app
pnpm --filter @mcbroken/mcall dev
pnpm --filter @mcbroken/mcus dev
pnpm --filter @mcbroken/mcau dev
```

### Database Operations

```bash
# Generate Prisma client (required after schema changes)
pnpm turbo run db:generate

# Create new migration
cd packages/database
pnpm prisma migrate dev --name your_migration_name

# Open Prisma Studio (GUI)
cd packages/database
pnpm prisma studio
```

### Quality Checks

```bash
# Type checking
pnpm turbo run check-types

# Linting
pnpm turbo run lint

# Auto-fix lint issues
pnpm turbo run lint:fix

# Run tests
pnpm turbo run test
```

## Turborepo Usage

### Filter by Package

```bash
# Run for specific package
pnpm turbo run build --filter=@mcbroken/frosty

# Run for package and its dependencies
pnpm turbo run build --filter=@mcbroken/frosty...

# Run for all apps
pnpm turbo run build --filter="./apps/*"
```

### Task Dependencies

Key tasks and their dependencies (from `turbo.json`):

| Task | Depends On |
|------|------------|
| `build` | `^build`, `db:generate` |
| `check-types` | `db:generate` |
| `test` | `db:generate` |
| `lint` | (none) |

### Cache Management

```bash
# Clear Turbo cache
rm -rf .turbo

# Run without cache
pnpm turbo run build --force
```

## Debugging

### Frontend

1. **React DevTools**: Install browser extension
2. **React Query DevTools**: Auto-included in dev mode
3. **Console logging**: Standard `console.log` in components

### Serverless

```bash
# Invoke function locally
cd apps/mcall
pnpm serverless invoke local -f getAllStores

# With event data
pnpm serverless invoke local -f getAllStores --data '{}'

# With environment variables
pnpm serverless invoke local -f getAllStores -e MCD_DEVICEID=xxx
```

### Database

```bash
# Open Prisma Studio
cd packages/database
pnpm prisma studio

# Enable query logging (in client.ts)
new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })
```

### Enable Verbose Logging

```bash
# Turbo
TURBO_LOG_VERBOSITY=3 pnpm turbo run build

# Prisma
DEBUG="prisma:*" pnpm turbo run db:generate
```

## Common Issues

### "Cannot find module '@mcbroken/db'"

```bash
pnpm turbo run db:generate
```

### "ECONNREFUSED" database errors

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Type errors in serverless apps

```bash
pnpm turbo run db:generate
pnpm turbo run build --filter=@mcbroken/db
pnpm turbo run build --filter=@mcbroken/mclogik
```

### Port 3000 in use

```bash
lsof -i :3000
kill -9 <PID>
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### Cursor / Claude Code

Entry points:
- `CLAUDE.md` (project root)
- `.cursorrules` (project root)
- `.ai/README.md` (navigation hub)
