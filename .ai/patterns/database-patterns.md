# Database Patterns

## Prisma Setup

### Client Singleton

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why singleton?**
- Prevents connection exhaustion in development (hot reload)
- Reuses connections across Lambda invocations (warm starts)

### Importing Prisma

```typescript
// In serverless handlers or services
import { prisma } from '@mcbroken/db';

// Never do this:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // Creates new connection each time!
```

## Query Patterns

### Find with Filters

```typescript
// Find stores in a country with mobile ordering
const stores = await prisma.pos.findMany({
  where: {
    country: 'US',
    hasMobileOrdering: true,
  },
  orderBy: { lastChecked: 'desc' },
  take: 100,
});
```

### Select Specific Fields

```typescript
// Only fetch needed fields
const stores = await prisma.pos.findMany({
  where: { country: 'EU' },
  select: {
    id: true,
    nationalStoreNumber: true,
    latitude: true,
    longitude: true,
    milkshakeStatus: true,
  },
});
```

### Upsert Pattern

```typescript
// Create or update a store
await prisma.pos.upsert({
  where: { nationalStoreNumber: store.id },
  update: {
    name: store.name,
    latitude: store.lat,
    longitude: store.lng,
    lastChecked: new Date(),
  },
  create: {
    nationalStoreNumber: store.id,
    name: store.name,
    latitude: store.lat,
    longitude: store.lng,
    country: 'US',
    hasMobileOrdering: store.hasMobileOrdering ?? false,
  },
});
```

### Batch Operations

```typescript
// Update many records
await prisma.pos.updateMany({
  where: {
    country: 'EU',
    lastChecked: { lt: oneHourAgo },
  },
  data: {
    milkshakeStatus: 'UNKNOWN',
  },
});

// Create many (skip duplicates)
await prisma.pos.createMany({
  data: stores.map(s => ({
    nationalStoreNumber: s.id,
    name: s.name,
    latitude: s.lat,
    longitude: s.lng,
    country: 'US',
  })),
  skipDuplicates: true,
});
```

### Transaction Pattern

```typescript
// Atomic operations
await prisma.$transaction(async (tx) => {
  // Update store
  await tx.pos.update({
    where: { id: storeId },
    data: { milkshakeStatus: 'AVAILABLE' },
  });

  // Update aggregated stats
  await tx.stats.update({
    where: { country: 'US' },
    data: {
      availableMilkshakes: { increment: 1 },
    },
  });
});
```

## Schema Conventions

### Model Naming

- Models: PascalCase singular (`Pos`, `Stats`)
- Fields: camelCase (`nationalStoreNumber`, `mcFlurryStatus`)

### Status Fields Pattern

For each tracked product, maintain three fields:

```prisma
model Pos {
  // Product status tracking pattern
  mcFlurryCount        Int        @default(0)      // Successful checks
  mcFlurryError        Int        @default(0)      // Failed checks
  mcFlurryStatus       ItemStatus @default(UNKNOWN) // Current status
}
```

### Indexing Strategy

```prisma
model Pos {
  // Index frequently filtered fields
  @@index([country], type: Hash)
  @@index([country, hasMobileOrdering])
}
```

## Migration Patterns

### Creating Migrations

```bash
cd packages/database

# Create migration from schema changes
pnpm prisma migrate dev --name add_new_field

# Name conventions:
# add_field_name
# remove_field_name
# create_table_name
# alter_table_name
```

### Migration Best Practices

1. **Small, focused migrations**: One logical change per migration
2. **Backwards compatible**: Add nullable fields or defaults
3. **Test locally first**: Always run `migrate dev` before `db:deploy`

### Deploying Migrations

```bash
# Development (creates migration + applies)
pnpm prisma migrate dev

# Production (applies pending migrations)
DATABASE_URL=<prod_url> pnpm prisma migrate deploy
```

## Debugging

### Enable Query Logging

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Prisma Studio

```bash
cd packages/database
pnpm prisma studio
# Opens GUI at http://localhost:5555
```

### Common Issues

**"Prepared statement already exists"**
- Cause: Multiple Prisma clients or connection pool issues
- Fix: Use singleton pattern, restart app

**Connection timeout in Lambda**
- Cause: Cold starts, connection limits
- Fix: Use connection pooling (PgBouncer, RDS Proxy)

**Migrations out of sync**
- Cause: Schema edited without migration
- Fix: `pnpm prisma migrate dev` or `prisma db push` for dev

## Performance Tips

1. **Select only needed fields**: Use `select` to reduce data transfer
2. **Index filtered columns**: Add indexes for `where` clause fields
3. **Batch operations**: Use `createMany`/`updateMany` for bulk ops
4. **Connection pooling**: Use adapter pattern for serverless
5. **Avoid N+1**: Use `include` for relations, not separate queries
