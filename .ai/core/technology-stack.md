# Technology Stack

> **Single source of truth** for version numbers. Do not duplicate versions elsewhere.

## Runtime Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22.11.0+ | See `.nvmrc` |
| pnpm | 10.x (9+ minimum) | Package manager |
| Docker | 20.10+ | For local PostgreSQL |
| Docker Compose | 2.0+ | For local development |

## Frontend Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.9 | React framework (App Router) |
| React | 19.1.0 | UI library |
| TypeScript | 5.2.2 - 5.9.2 | Type safety (varies by package) |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| TailwindCSS | 3.3.3 | Utility-first CSS |
| tailwindcss-animate | 1.0.7 | Animation utilities |
| Radix UI | various | Accessible primitives |
| shadcn/ui | - | Component library (not versioned) |
| Lucide React | 0.508.0 | Icon library |

### Data & Maps

| Technology | Version | Purpose |
|------------|---------|---------|
| React Query | 3.39.3 | Data fetching & caching |
| Mapbox GL | 2.15.0 | Map rendering |
| react-map-gl | 7.1.6 | React Mapbox wrapper |
| Axios | 1.5.0+ | HTTP client |

### Analytics

| Technology | Purpose |
|------------|---------|
| @vercel/analytics | Vercel Analytics |
| next-plausible | Plausible (self-hosted) |

## Backend Stack

### Serverless Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Serverless Framework | 3.40.0 | Lambda deployment |
| serverless-esbuild | 1.54.8 | TypeScript bundling |
| serverless-offline | 14.4.0 | Local development |
| esbuild | 0.25.0 | Fast bundler |

### AWS Lambda Runtime

| Setting | Value |
|---------|-------|
| Runtime | Node.js 20.x |
| Architecture | x86_64 |
| Default Memory | 368MB |
| Default Timeout | 60s (varies by function) |

### Business Logic

| Technology | Version | Purpose |
|------------|---------|---------|
| @sailplane/logger | 4.2.0 | Structured logging |
| p-queue | 7.4.1 | Rate limiting |
| Axios | 1.13.2 | HTTP requests |
| AWS SDK S3 | 3.x | S3 uploads |

## Database Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 17 | Primary database |
| Prisma | 6.19.1 | ORM |
| @prisma/adapter-pg | 6.19.1 | Postgres adapter |
| pg | 8.x | Node.js PostgreSQL driver |

## Development Tools

### Build & Monorepo

| Technology | Version | Purpose |
|------------|---------|---------|
| Turborepo | latest | Monorepo orchestration |
| pnpm | 10.x | Package manager |

### Code Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | 9.x | Linting |
| typescript-eslint | 8.x | TS linting |
| Prettier | 3.7.4 | Code formatting |
| Husky | - | Git hooks |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 4.0.16 | Unit testing (mclogik) |
| Jest | - | Legacy tests |

## Key Dependencies by Package

### @mcbroken/frosty (frontend)

```json
{
  "next": "15.5.9",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "tailwindcss": "3.3.3",
  "mapbox-gl": "2.15.0",
  "react-map-gl": "7.1.6",
  "react-query": "3.39.3"
}
```

### @mcbroken/mclogik (shared logic)

```json
{
  "@aws-sdk/client-s3": "^3.962.0",
  "@sailplane/logger": "^4.2.0",
  "axios": "^1.13.2",
  "p-queue": "^7.4.1"
}
```

### @mcbroken/db (database)

```json
{
  "@prisma/client": "6.19.1",
  "@prisma/adapter-pg": "6.19.1",
  "prisma": "6.19.1",
  "pg": "^8.16.3"
}
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `MCD_DEVICEID` | Yes (serverless) | McDonald's device ID |
| `BASIC_TOKEN_US` | Yes (mcus) | US API auth token |
| `BASIC_TOKEN_EU` | Yes (mcall) | EU API auth token |
| `BASIC_TOKEN_AP` | Yes (mcau) | AP API auth token |
| `BASIC_TOKEN_EL` | Yes (mcall) | EL API auth token |
| `API_KEY_AP` | Yes (mcau) | AP API key |
| `KEY` | Yes (serverless) | Encryption key |
| `EXPORT_BUCKET` | Yes (serverless) | S3 bucket for exports |
| `NEXT_PUBLIC_MAPBOX_KEY` | Yes (frontend) | Mapbox public token |

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2022+ JavaScript features
- CSS Grid and Flexbox
