# Technology Stack

> **Single source of truth** for version numbers. Do not duplicate versions elsewhere.

## Runtime Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 26.7.0 local/CI; 24 managed production | See `.nvmrc`; AWS Lambda and Vercel remain on managed Node.js 24 |
| pnpm | 11.20.0 | Install explicitly; Node.js 26 does not bundle Corepack |
| Docker | 20.10+ | For local PostgreSQL |
| Docker Compose | 2.0+ | For local development |

## Frontend Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.3.0 | React framework (App Router) |
| React | 19.2.8 | UI library |
| TypeScript | 6.0.3 | Type safety |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| TailwindCSS | 4.3.3 | Utility-first CSS |
| Radix UI | 1.6.7 | Accessible primitives |
| shadcn/ui | - | Component library (not versioned) |
| Lucide React | 1.30.0 | Icon library |

### Data & Maps

| Technology | Version | Purpose |
|------------|---------|---------|
| TanStack React Query | 5.101.4 | Data fetching & caching |
| Mapbox GL | 3.28.1 | Map rendering |
| react-map-gl | 8.1.2 | React Mapbox wrapper |
| Axios | 1.19.0 | HTTP client |

### Analytics

| Technology | Purpose |
|------------|---------|
| @vercel/analytics 2.0.1 | Vercel Analytics |

## Backend Stack

### Serverless Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Serverless Framework | 4.40.0 | Lambda deployment and built-in esbuild |
| serverless-offline | 14.8.0 | Local development |

### AWS Lambda Runtime

| Setting | Value |
|---------|-------|
| Runtime | Node.js 24.x |
| Architecture | x86_64 |
| Default Memory | 368MB |
| Default Timeout | 60s (varies by function) |

### Business Logic

| Technology | Version | Purpose |
|------------|---------|---------|
| @sailplane/logger | 6.0.0 | Structured logging |
| @sentry/aws-serverless | 10.69.0 | Error reporting |
| p-queue | 9.3.3 | Rate limiting |
| Axios | 1.19.0 | HTTP requests |
| AWS SDK S3 | 3.1105.0 | S3 uploads |

## Database Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 17 | Primary database |
| Prisma | 7.9.1 | ORM |
| @prisma/adapter-pg | 7.9.1 | Postgres adapter |
| pg | 8.22.0 | Node.js PostgreSQL driver |

## Development Tools

### Build & Monorepo

| Technology | Version | Purpose |
|------------|---------|---------|
| Turborepo | 2.10.8 | Monorepo orchestration |
| pnpm | 11.20.0 | Package manager |

### Code Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | 9.39.2 | Linting; held below v10 for React plugin peer compatibility |
| typescript-eslint | 8.66.0 | TS linting |
| Prettier | 3.9.6 | Code formatting |
| Husky | 9.1.7 | Git hooks |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 4.1.10 | Unit testing |

## Key Dependencies by Package

### @mcbroken/frosty (frontend)

```json
{
  "next": "16.3.0",
  "react": "19.2.8",
  "react-dom": "19.2.8",
  "tailwindcss": "4.3.3",
  "mapbox-gl": "3.28.1",
  "react-map-gl": "8.1.2",
  "@tanstack/react-query": "5.101.4"
}
```

### @mcbroken/mclogik (shared logic)

```json
{
  "@aws-sdk/client-s3": "3.1105.0",
  "@sailplane/logger": "6.0.0",
  "axios": "1.19.0",
  "p-queue": "9.3.3"
}
```

### @mcbroken/db (database)

```json
{
  "@prisma/client": "7.9.1",
  "@prisma/adapter-pg": "7.9.1",
  "prisma": "7.9.1",
  "pg": "8.22.0"
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
