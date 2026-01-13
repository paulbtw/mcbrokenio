# McBroken

The project idea is inspired by [McBroken.com](https://mcbroken.com/) made by [rashiq](https://rashiq.me/).

## Features

- View the status of ice machines for McFlurry, McSundae, and milkshake products at McDonald's locations in the US, EU, and Australia.

## Built With

- [Turborepo](https://turbo.build/repo) - Monorepo build system
- [Serverless Framework](https://www.serverless.com/) 3.x - AWS Lambda deployment
- [Prisma](https://www.prisma.io/) 6.x - ORM with PostgreSQL 17
- [Next.js](https://nextjs.org/) 15 - Frontend framework (App Router + Turbopack)
- [React](https://react.dev/) 19 - UI library
- [TailwindCSS](https://tailwindcss.com/) 3.x - Styling
- [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Mapbox GL](https://www.mapbox.com/) - Map rendering
- [pnpm](https://pnpm.io/) 10.x - Package manager

## Project Structure

This project uses a monorepo structure managed by Turborepo:

```text
apps/
├── frontend/      # Next.js 15 application - @mcbroken/frosty
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

- **Node.js** 22+ (see `.nvmrc`)
- **pnpm** 10.x (9+ minimum)
- **Docker** and **Docker Compose** for local PostgreSQL

## Setup

1. **Tokens**: You need to have basic tokens from the McDonald's app to use their API.
2. **Environment**: Copy `.env.dist` to `.env` and fill in the required values.
3. **Install**: Run `pnpm install` to install all dependencies across the monorepo.
4. **Database**: Run `docker-compose -f docker-compose.dev.yml up -d` to start your local PostgreSQL database.
5. **Generate Prisma Client**: Run `pnpm turbo run db:generate` to generate the Prisma client.

## Development

```bash
# Start all services
pnpm dev

# Run a specific app
pnpm --filter @mcbroken/frosty dev

# Generate Prisma client (required after schema changes)
pnpm turbo run db:generate

# Run type checking
pnpm turbo run check-types

# Run linting
pnpm turbo run lint

# Run tests
pnpm turbo run test

# Invoke a serverless function locally
cd apps/mcall
pnpm invoke functionName
pnpm invoke getItemStatus -- --data '{"countryList": ["US"]}'
```

## Documentation

For detailed documentation, see the `.ai/` directory:
- Project overview and architecture
- Development workflow
- Code patterns and conventions

## Information about the different McDonalds APIs

You can find more information about the APIs [here](docs/API.md).
