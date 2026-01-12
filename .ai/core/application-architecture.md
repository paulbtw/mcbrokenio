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
│    │ GeoJSON      │     │ Store Data   │     │ Tiles        │              │
│    │ Stats JSON   │     │ Statistics   │     │              │              │
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
│   │   ├── useMcData.ts         # Store data fetching
│   │   ├── useMcStats.ts        # Statistics fetching
│   │   └── useLocation.ts       # User location
│   ├── useMapInteractions.ts
│   ├── useDebounce.ts
│   └── useSettings.ts
├── lib/
│   ├── utils.ts                 # Utility functions (cn, etc.)
│   └── constants.ts             # App constants
├── provider/
│   └── ReactQueryProvider.tsx   # React Query setup
├── types/
│   └── index.ts                 # TypeScript types
└── middleware.ts                # Geolocation middleware
```

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
│ React Query      │ ← Fetches GeoJSON from S3 (via rewrites)
│ Hooks            │
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
│   └── handlers/
│       ├── getAllStores.ts      # Fetch store locations
│       ├── getItemStatus.ts     # Check product availability
│       └── createJson.ts        # Generate exports (mcall only)
├── serverless.ts                # Serverless Framework config
└── package.json
```

### Function Responsibilities

| Function | Purpose | Schedule |
|----------|---------|----------|
| `getAllStores` | Fetch McDonald's locations from API | Weekly |
| `getItemStatus` | Check ice cream availability | Hourly/30min |
| `createJson` | Generate GeoJSON + stats to S3 | Every 15 min |

### Shared Logic (mclogik)

```
packages/mclogik/src/
├── services/
│   ├── getAllStores/            # Store collection
│   │   ├── getStoreListLocation/
│   │   ├── getStorelistUrl/
│   │   └── savePos.ts
│   ├── getItemStatus/           # Availability checking
│   │   ├── checkForProduct.ts
│   │   ├── getItemStatus{Eu,Us,El,Au}.ts
│   │   ├── getUpdatedPos.ts
│   │   └── updatePos.ts
│   ├── createJson/              # Export generation
│   │   ├── generateGeoJson.ts
│   │   └── generateStats.ts
│   └── token/                   # Auth token management
│       ├── getBearerToken.ts
│       └── getClientId.ts
├── constants/
│   └── index.ts                 # Regional configs
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
│ mclogik          │◄────│ Store Data       │
│ savePos()        │     │ Response         │
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
│ mclogik          │────►│ McDonald's       │
│ checkForProduct  │     │ Store API        │
└──────────────────┘     └──────────────────┘
       │                          │
       ▼                          ▼
┌──────────────────┐     ┌──────────────────┐
│ Update Pos       │◄────│ Product          │
│ status fields    │     │ availability     │
└──────────────────┘     └──────────────────┘
```

### Export Generation Flow

```
CloudWatch Cron (every 15 min)
       │
       ▼
┌──────────────────┐
│ createJson       │
│ Lambda           │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Query all stores │
│ from PostgreSQL  │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ generateGeoJson  │
│ generateStats    │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Upload to S3     │
│ EXPORT_BUCKET    │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Frontend fetches │
│ via Next.js      │
│ rewrites         │
└──────────────────┘
```

## Security Considerations

1. **API Tokens**: Stored in environment variables, regional McDonald's OAuth
2. **Database**: Connection via DATABASE_URL, Prisma pooled connections
3. **S3**: Bucket policies restrict write to Lambda IAM roles
4. **Frontend**: No sensitive data exposed, S3 assets proxied via rewrites
