# Application Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                     │
│                                                                             │
│    Browser ──────► Vercel Edge ──────► Next.js App (apps/frontend)         │
│                         │                      │                            │
│                    Geolocation            React Query                       │
│                    Middleware             Data Fetch                        │
└────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                       │
│                                                                             │
│    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐              │
│    │ Amazon S3    │     │ PostgreSQL   │     │ Mapbox       │              │
│    │ Snapshot v2  │     │ Store Data   │     │ Tiles        │              │
│    │ Legacy JSON  │     │ Catalog life │     │              │              │
│    └──────────────┘     └──────────────┘     └──────────────┘              │
└────────────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
┌────────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING LAYER                                    │
│                                                                             │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │ mcall           │  │ mcus            │  │ mcau            │           │
│    │ (eu-central-1)  │  │ (us-east-2)     │  │ (ap-southeast-2)│           │
│    │                 │  │                 │  │                 │           │
│    │ • getAllStores  │  │ • getAllStores  │  │ • getAllStores  │           │
│    │ • getItemStatus │  │ • getItemStatus │  │ • getItemStatus │           │
│    │ • createJson    │  │                 │  │                 │           │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│              │                   │                   │                      │
│              └───────────────────┼───────────────────┘                      │
│                                  ▼                                          │
│                      ┌─────────────────────┐                                │
│                      │ mclogik (shared)    │                                │
│                      │ Business Logic      │                                │
│                      └─────────────────────┘                                │
└────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL APIS                                       │
│                                                                             │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │ McDonald's EU   │  │ McDonald's US   │  │ McDonald's AP   │           │
│    │ API             │  │ API             │  │ API             │           │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### App Router Structure

```
apps/frontend/src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (providers, metadata)
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── Map/                     # Map display components
│   ├── Stats/                   # Statistics components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DesktopView.tsx
│   ├── MobileView.tsx
│   └── LocationList.tsx
├── hooks/
│   ├── queries/                 # React Query hooks
│   │   ├── usePublishedAvailabilitySnapshot.ts # Shared snapshot query
│   │   ├── useMcData.ts         # Marker projection
│   │   └── useMcStats.ts        # Statistics projection
│   ├── useMapInteractions.ts
│   ├── useDebounce.ts
│   └── useSettings.ts
├── lib/
│   ├── constants.ts             # App constants
│   ├── geo.ts                   # GeoJSON helpers
│   ├── stats.ts                 # Statistics helpers
│   └── utils.ts                 # Utility functions (cn, etc.)
├── provider/
│   └── ReactQueryProvider.tsx   # React Query setup
└── middleware.ts                # Geolocation middleware
```

Published availability contracts are imported from
`@mcbroken/mclogik/publishedAvailabilitySnapshot` so the frontend does not
maintain a parallel types directory.

### Data Flow (Frontend)

```
User visits site
       │
       ▼
┌──────────────────┐
│ Vercel Edge      │ ← Sets geo cookies (lat/lng)
│ Middleware       │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ React Query      │ ← Fetches snapshot.json through a rewrite; only a
│ Snapshot Query   │   missing 403/404 falls back to marker.json + stats.json
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Mapbox GL        │ ← Renders stores on map
│ Component        │
└──────────────────┘
```

## Serverless Architecture

### Handler Structure

```
apps/mc{all,us,au}/
├── src/
│   ├── getAllStores/index.ts    # Store Catalog Refresh adapter
│   ├── getItemStatus/index.ts   # Availability Poll adapter
│   └── createJson/index.ts      # Snapshot publication adapter (mcall only)
├── serverless.ts                # Serverless Framework config
└── package.json
```

### Function Responsibilities

| Function        | Purpose                           | Schedule     |
| --------------- | --------------------------------- | ------------ |
| `getAllStores`  | Refresh the Store Catalog         | Weekly       |
| `getItemStatus` | Run an Availability Poll          | Hourly/30min |
| `createJson`    | Publish the Availability Snapshot | Every 15 min |

### Shared Logic (mclogik)

```
packages/mclogik/src/
├── services/
│   ├── storeCatalogRefresh/     # Deep Store Catalog Refresh module
│   │   ├── StoreCatalogRefreshModule.ts
│   │   ├── storeCatalogDiscoveryNetwork.ts
│   │   └── index.ts             # Production facade and composition
│   ├── availabilityPolling/     # Deep Availability Poll module
│   │   ├── AvailabilityPollingModule.ts
│   │   ├── availabilityPollPersistence.ts
│   │   ├── productAvailabilityNetwork.ts
│   │   └── index.ts             # Production facade and composition
│   ├── publishedAvailabilitySnapshot/
│   │   ├── PublishedAvailabilitySnapshotModule.ts
│   │   └── index.ts             # Production facade and composition
│   └── token/                   # Auth token management
│       ├── getBearerToken.ts
│       └── getClientId.ts
├── constants/
│   └── index.ts                 # Regional configs
├── clients/
│   ├── McdonaldsApiClient.ts    # Regional network adapters
│   ├── networkFailure.ts        # Sanitized typed transport failures
│   ├── upstreamResponse.ts      # Shared untrusted JSON object guard
│   ├── ProductAvailability.ts   # Product Availability calculation
│   └── StoreDiscoveryClient.ts  # Store discovery adapter
├── markets/
│   └── marketDefinitions.ts     # Market and Catalog Scope selection
└── utils/
    ├── generateCoordinatesMesh.ts
    ├── chunkArray.ts
    └── randomUserAgent.ts
```

## Database Schema

### Pos Model (Store)

```prisma
model Pos {
  id                  String     @id
  nationalStoreNumber String
  name                String
  latitude            String
  longitude           String
  country             String

  // McFlurry tracking
  mcFlurryCount       Int        @default(0)
  mcFlurryError       Int        @default(0)
  mcFlurryStatus      ItemStatus @default(UNKNOWN)

  // McSundae tracking
  mcSundaeCount       Int        @default(0)
  mcSundaeError       Int        @default(0)
  mcSundaeStatus      ItemStatus @default(UNKNOWN)

  // Milkshake tracking
  milkshakeCount      Int        @default(0)
  milkshakeError      Int        @default(0)
  milkshakeStatus     ItemStatus @default(UNKNOWN)

  customItems         Json       @default("[]")
  hasMobileOrdering   Boolean    @default(false)
  lastChecked         DateTime?
  updatedAt           DateTime   @updatedAt @default(now())
  createdAt           DateTime   @default(now())

  @@index([country], type: Hash)
  @@index([country, hasMobileOrdering])
}
```

### Stats Model (Aggregated)

```prisma
model Stats {
  country             String   @id
  totalMcd            Int
  availableMilkshakes Int
  trackableMilkshakes Int
  availableMcFlurry   Int
  trackableMcFlurry   Int
  availableMcSundae   Int
  trackableMcSundae   Int
  updatedAt           DateTime @updatedAt
  createdAt           DateTime @default(now())
}
```

### ItemStatus Enum

```prisma
enum ItemStatus {
  AVAILABLE
  PARTIAL_AVAILABLE
  UNAVAILABLE
  NOT_APPLICABLE
  UNKNOWN
}
```

## Data Flow Diagrams

### Store Collection Flow

```
CloudWatch Cron (weekly)
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│ getAllStores     │────►│ McDonald's       │
│ Lambda           │     │ Location API     │
└──────────────────┘     └──────────────────┘
       │                          │
       ▼                          ▼
┌──────────────────┐     ┌──────────────────┐
│ Store Catalog    │◄────│ Store Data       │
│ Refresh module   │     │ Response         │
└──────────────────┘     └──────────────────┘
       │
       ▼
┌──────────────────┐
│ PostgreSQL       │
│ Pos table        │
└──────────────────┘
```

### Availability Check Flow

```
CloudWatch Cron (hourly)
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│ getItemStatus    │────►│ Query stores     │
│ Lambda           │     │ with mobile      │
└──────────────────┘     │ ordering         │
       │                 └──────────────────┘
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Availability     │────►│ McDonald's       │
│ Poll module      │     │ regional network │
└──────────────────┘     └──────────────────┘
       │                          │
       ▼                          ▼
┌──────────────────┐     ┌──────────────────┐
│ Atomic store     │◄────│ Product          │
│ health + status  │     │ availability     │
└──────────────────┘     └──────────────────┘
```

### Published Availability Snapshot Flow

```
CloudWatch Cron (every 15 min)
       │
       ▼
┌──────────────────┐
│ createJson       │
│ Lambda adapter   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Read Store       │
│ Catalog once     │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Build markers +  │
│ aggregate stats  │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Publish v2       │
│ snapshot +       │
│ legacy assets    │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Frontend fetches │
│ snapshot; missing│
│ file falls back  │
└──────────────────┘
```

## Security Considerations

1. **API Tokens**: Stored in environment variables, regional McDonald's OAuth
2. **Database**: Connection via DATABASE_URL, Prisma pooled connections
3. **S3**: Bucket policies restrict write to Lambda IAM roles
4. **Frontend**: No sensitive data exposed, S3 assets proxied via rewrites
