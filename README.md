# McBroken

The project idea is inspired by [McBroken.com](https://mcbroken.com/) made by [rashiq](https://rashiq.me/).

## Features

- View the status of ice machines for McFlurry, McSundae, and milkshake products at McDonald's locations in the US, EU, and Australia.

## Built With

- [Turborepo](https://turbo.build/repo) - Monorepo build system
- [Serverless](https://www.serverless.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - ORM
- [Next.js](https://nextjs.org/) - Frontend framework (App Router)
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [pnpm](https://pnpm.io/) - Package manager

## Project Structure

This project uses a monorepo structure managed by Turborepo:

- `apps/`
  - `frontend`: Next.js application (UI)
  - `mcall`, `mcau`, `mcus`: Serverless functions for different regions
- `packages/`
  - `database`: Prisma schema and client
  - `mclogik`: Shared logic and services
  - `*-config`: Shared configurations (ESLint, TypeScript, Serverless)

## Setup

1. **Prerequisites**: Ensure you have [pnpm](https://pnpm.io/installation) installed.
2. **Tokens**: You need to have basic tokens from the McDonald's app to use their API.
3. **Environment**: Fill out the `.env.dist` file and rename it to `.env` in the root (and potentially in specific app directories if needed).
4. **Install**: Run `pnpm install` to install all dependencies across the monorepo.
5. **Database**: Run `docker-compose -f docker-compose.dev.yml up -d` to start your local PostgreSQL database.
6. **Development**:
    - To run the entire stack: `pnpm dev` (uses Turborepo)
    - To run a specific app (e.g., frontend): `pnpm --filter @mcbroken/frosty dev`
    - To invoke a serverless function locally:
      ```bash
      cd apps/mcall
      pnpm invoke -f functionName
      # To invoke with data (e.g., for getItemStatus with specific countries)
      pnpm invoke -f getItemStatus --data '{"countryList": ["US"]}'
      ```

## Information about the different McDonalds APIs

You can find more information about the APIs [here](docs/API.md).
