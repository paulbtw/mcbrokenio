# McBroken

The project idea is inspired by [McBroken.com](https://mcbroken.com/) made by [rashiq](https://rashiq.me/).

## Features

- View the status of ice machines for McFlurry, McSundae, and milkshake products at McDonald's locations in the US, EU, and Australia.

## Built With

- [Turborepo](https://turbo.build/repo) - Monorepo build system
- [Serverless Framework](https://www.serverless.com/) 4.x - AWS Lambda deployment
- [Prisma](https://www.prisma.io/) 7.x - ORM with PostgreSQL 17
- [Next.js](https://nextjs.org/) 16 - Frontend framework (App Router + Turbopack)
- [React](https://react.dev/) 19 - UI library
- [TailwindCSS](https://tailwindcss.com/) 4.x - Styling
- [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Mapbox GL](https://www.mapbox.com/) - Map rendering
- [pnpm](https://pnpm.io/) 11.x - Package manager

## Project Structure

This project uses a monorepo structure managed by Turborepo:

```text
apps/
├── frontend/      # Next.js 16 application - @mcbroken/frosty
├── mcall/         # Serverless: EU region - @mcbroken/mcall
├── mcus/          # Serverless: US region - @mcbroken/mcus
└── mcau/          # Serverless: AU region - @mcbroken/mcau
packages/
├── database/      # Prisma client & schema - @mcbroken/db
├── mclogik/       # Shared business logic - @mcbroken/mclogik
├── eslint-config/ # Shared ESLint config
├── typescript-config/ # Shared TypeScript config
└── serverless-config/ # Shared Serverless config
```

## Prerequisites

- **Node.js** 26.7.0 for local development (see `.nvmrc`); managed production runtimes remain on Node.js 24
- **pnpm** 11.20.0, installed explicitly (`npm install --global pnpm@11.20.0`; Node.js 26 does not bundle Corepack)
- **Docker** and **Docker Compose** for local PostgreSQL

## Setup

1. **Tokens**: You need to have basic tokens from the McDonald's app to use their API.
2. **Environment**: Copy `.env.dist` to `.env` and fill in the required values.
3. **Install**: Run `pnpm install` to install all dependencies across the monorepo.
4. **Database**: Run `docker-compose -f docker-compose.dev.yml up -d` to start your local PostgreSQL database.
5. **Generate Prisma Client**: Run `pnpm turbo run db:generate` to generate the Prisma client.

## Development

```bash
# Run a specific app
pnpm --filter @mcbroken/frosty dev

# Generate Prisma client (required after schema changes)
pnpm --filter @mcbroken/db db:generate

# Run type checking
pnpm check-types

# Run linting
pnpm lint

# Run tests
pnpm test

# Run the full local CI suite
pnpm verify

# Invoke a serverless function locally
cd apps/mcall
pnpm invoke functionName
pnpm invoke getItemStatus -- --data '{"countryList": ["US"]}'
```

## GitHub Actions Deployments

Manual deployments are handled through [`deploy.yml`](.github/workflows/deploy.yml) with the GitHub Actions "Run workflow" button.

- Choose `staging` or `production`
- Choose `all`, `mcall`, `mcus`, `mcau`, or `frontend`
- Every deployment runs the full verification suite first

### Required GitHub Environment Secrets

Configure the `staging` and `production` GitHub environments with these secrets:

- `AWS_DEPLOY_ROLE_ARN`
- `DATABASE_URL`
- `BASIC_TOKEN_EU`
- `BASIC_TOKEN_EL`
- `BASIC_TOKEN_US`
- `BASIC_TOKEN_AP`
- `KEY`
- `MCALL_DEPLOYMENT_BUCKET`
- `MCUS_DEPLOYMENT_BUCKET`
- `MCAU_DEPLOYMENT_BUCKET`
- `SENTRY_DSN`
- `SERVERLESS_ACCESS_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_MAPBOX_KEY`

If deployment bucket secrets are omitted, the serverless apps use their existing shared bucket names, such as `mcbrokenio-mcall-bucket-dev`.

Deployments are manual. The workflow never deploys automatically, and the three production Lambda services must remain deployed in their separate AWS regions because the McDonald's APIs have region-specific IP requirements.

> **Runtime follow-up (2026-08-07):** Move managed production from Node.js 24 to Node.js 26 only after Node.js 26 is LTS and both AWS Lambda and Vercel provide managed support. Update runtime declarations, Node types, build targets, and provider settings together.

## Documentation

For detailed documentation, see the `.ai/` directory:

- Project overview and architecture
- Development workflow
- Code patterns and conventions

## Information about the different McDonalds APIs

You can find more information about the APIs [here](docs/API.md).
