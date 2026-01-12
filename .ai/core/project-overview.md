# Project Overview

## What is McBroken?

McBroken is an open-source McDonald's ice cream machine availability tracker. It monitors the availability of ice cream products (McFlurry, McSundae, Milkshakes) across McDonald's locations in multiple geographic regions.

**Inspiration**: mcbroken.com - the original ice cream machine tracker

## Core Value Proposition

- **Real-time tracking**: Monitors ice cream availability across thousands of stores
- **Multi-region support**: US, EU, and Australia coverage
- **Interactive visualization**: Map-based interface showing store status
- **Open source**: Self-hostable, transparent implementation

## What the System Does

1. **Collects store data** from McDonald's location APIs
2. **Checks product availability** at regular intervals via scheduled Lambda functions
3. **Stores data** in PostgreSQL for persistence and querying
4. **Generates GeoJSON** exports for efficient map rendering
5. **Displays status** on an interactive Next.js frontend with Mapbox

## Repository Structure

```
kingston/                        # Monorepo root
├── apps/
│   ├── frontend/                # Next.js web application
│   ├── mcall/                   # Serverless: EU + other regions
│   ├── mcus/                    # Serverless: United States
│   └── mcau/                    # Serverless: Australia/AP
├── packages/
│   ├── database/                # Prisma schema & client
│   ├── mclogik/                 # Shared business logic
│   ├── eslint-config/           # Shared ESLint rules
│   ├── typescript-config/       # Shared TypeScript configs
│   └── serverless-config/       # Shared Serverless config
├── docs/                        # API documentation
└── .ai/                         # AI assistant documentation
```

## Package Names

| Directory | Package Name | Purpose |
|-----------|--------------|---------|
| `apps/frontend` | `@mcbroken/frosty` | Next.js frontend |
| `apps/mcall` | `@mcbroken/mcall` | EU serverless functions |
| `apps/mcus` | `@mcbroken/mcus` | US serverless functions |
| `apps/mcau` | `@mcbroken/mcau` | AU serverless functions |
| `packages/database` | `@mcbroken/db` | Prisma client & schema |
| `packages/mclogik` | `@mcbroken/mclogik` | Shared business logic |

## Key Concepts

### Product Tracking

The system tracks three ice cream product categories:
- **McFlurry**: Soft-serve with mix-ins
- **McSundae**: Soft-serve sundaes
- **Milkshake**: Blended milkshakes

### Status Values

Each product at each store has a status:
- `AVAILABLE` - Product currently available
- `PARTIAL_AVAILABLE` - Some variants available
- `UNAVAILABLE` - Product not available
- `NOT_APPLICABLE` - Store doesn't offer product
- `UNKNOWN` - Status could not be determined

### Regional Architecture

Separate serverless deployments handle different McDonald's API regions:
- **mcall**: Europe (eu-central-1) + other regions (EL)
- **mcus**: United States (us-east-2)
- **mcau**: Australia/Asia-Pacific (ap-southeast-2)

## Who This Project Serves

- **End users**: People wanting to find working ice cream machines
- **Developers**: Those interested in web scraping, serverless, or Next.js patterns
- **Self-hosters**: Anyone wanting to run their own instance
