# Deployment Architecture

## Overview

McBroken uses a multi-cloud deployment strategy:
- **Frontend**: Vercel (Next.js hosting)
- **Serverless**: AWS Lambda (3 regional deployments)
- **Database**: AWS RDS or self-hosted PostgreSQL
- **Storage**: Amazon S3 (Published Availability Snapshot)

## Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         VERCEL                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ apps/frontend                                               │  │
│  │ • Proxy-based geolocation cookie handling                   │  │
│  │ • Serverless Functions (API routes)                         │  │
│  │ • Static Assets (CDN)                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                           AWS                                     │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ eu-central-1    │  │ us-east-2       │  │ ap-southeast-2  │   │
│  │                 │  │                 │  │                 │   │
│  │ Lambda: mcall   │  │ Lambda: mcus    │  │ Lambda: mcau    │   │
│  │ S3: exports     │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                        RDS / Aurora                          │ │
│  │                     PostgreSQL 17                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Regional Lambda Deployments

### mcall (Europe)

| Setting | Value |
|---------|-------|
| Region | eu-central-1 (Frankfurt) |
| Bucket | mcbrokenio-mcall-bucket-dev |
| Functions | getAllStores, getItemStatusEu, getItemStatusEl, createJson |

**Schedules**:
- `getAllStores`: Sunday 00:05 UTC
- `getItemStatusEu`: Hourly at :05
- `getItemStatusEl`: Hourly at :20
- `createJson`: Every 15 minutes

### mcus (United States)

| Setting | Value |
|---------|-------|
| Region | us-east-2 (Ohio) |
| Bucket | mcbrokenio-mcus-bucket-dev |
| Functions | getAllStores, getItemStatus |

**Schedules**:
- `getAllStores`: Weekly, staggered by US sub-region
- `getItemStatus`: Every 30 minutes

### mcau (Australia)

| Setting | Value |
|---------|-------|
| Region | ap-southeast-2 (Sydney) |
| Bucket | mcbrokenio-mcau-bucket-dev |
| Functions | getAllStores, getItemStatus |

**Schedules**:
- `getAllStores`: Weekly (AU, AU2)
- `getItemStatus`: Hourly at :00

## Lambda Configuration

### Common Settings

```typescript
// From packages/serverless-config
{
  runtime: 'nodejs24.x',
  architecture: 'x86_64',
  memorySize: 368,  // Default, varies by function
  timeout: 60,      // Default, varies by function
}
```

### esbuild Configuration

```typescript
{
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'node24',
  platform: 'node',
  external: ['aws-sdk'],
}
```

### Prisma Lambda Handling

Prisma 7 uses `PrismaPg` and the Rust-free generated client. Serverless v4's
built-in esbuild bundles the client, adapter, and `pg` implementation; no native
query engine is copied into Lambda packages.

## Deployment Commands

### Staging

```bash
# Deploy single app
pnpm --filter @mcbroken/mcall deploy:staging

# Deploy all serverless apps
pnpm turbo run deploy:staging --filter="./apps/mc*"
```

### Production

```bash
# Deploy single app
pnpm --filter @mcbroken/mcall deploy:production

# Deploy all serverless apps
pnpm turbo run deploy:production --filter="./apps/mc*"
```

### Frontend (Vercel)

```bash
# Via Vercel CLI
cd apps/frontend
vercel deploy --prod

# Or via Git push (if connected)
git push origin main
```

## CI/CD Pipeline

AWS deployments are manual through `workflow_dispatch`; CI does not deploy on
its own. The three production services stay in Frankfurt, Ohio, and Sydney so
their outbound IP regions satisfy the corresponding McDonald's API requirements.

As of 2026-08-07, production remains on managed Node.js 24. Move to Node.js 26
only after it is LTS and both AWS Lambda and Vercel expose managed support, then
update Node types, build targets, Lambda runtime, and Vercel settings together.

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.20.0
      - uses: actions/setup-node@v4
        with:
          node-version: '26'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm turbo run db:generate
      - run: pnpm turbo run check-types
      - run: pnpm turbo run lint
      - run: pnpm turbo run test
```

## Environment Configuration

### Vercel Environment Variables

Set in Vercel Dashboard or `vercel.json`:

| Variable | Scope |
|----------|-------|
| `NEXT_PUBLIC_MAPBOX_KEY` | Production, Preview |

### AWS Lambda Environment Variables

Set in `serverless.ts` or AWS Console:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `MCD_DEVICEID` | McDonald's device identifier |
| `BASIC_TOKEN_*` | Regional API tokens |
| `EXPORT_BUCKET` | S3 bucket name |
| `KEY` | Encryption/auth key |

## Database Deployment

### Migrations

```bash
# Deploy pending migrations
DATABASE_URL=<production_url> pnpm turbo run db:deploy
```

### Connection Pooling

For serverless, consider:
- PgBouncer for connection pooling
- Prisma Accelerate
- AWS RDS Proxy

## Monitoring

### CloudWatch (Lambda)

- Function logs in `/aws/lambda/<function-name>`
- Metrics: Invocations, Errors, Duration
- Alarms: Error rate, Throttling

### Vercel (Frontend)

- Deployment logs in Vercel Dashboard
- Analytics via `@vercel/analytics`
- Web Vitals monitoring

## Scaling Considerations

1. **Lambda Concurrency**: Default is 1000 concurrent executions per region
2. **Database Connections**: Use pooling for serverless
3. **S3 Throughput**: CloudFront CDN for high-traffic GeoJSON
4. **Rate Limiting**: p-queue in mclogik prevents McDonald's API throttling
