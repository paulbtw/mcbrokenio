# Common Development Tasks

## Adding a New Country/Region

### 1. Add Country Configuration

```typescript
// packages/mclogik/src/constants/index.ts

export const NEW_COUNTRY_INFO = {
  code: 'XX',
  name: 'New Country',
  apiBaseUrl: 'https://api.mcdonalds.xx',
  // ... other config
};
```

### 2. Create Item Status Handler

```typescript
// packages/mclogik/src/services/getItemStatus/getItemStatusXx.ts

import type { PrismaClient } from '@prisma/client';
import { getUpdatedPos } from './getUpdatedPos';
import { updatePos } from './updatePos';

export async function getItemStatusXx(prisma: PrismaClient) {
  const stores = await getUpdatedPos(prisma, 'XX');
  // Implement country-specific logic
  await updatePos(prisma, stores);
}
```

### 3. Add Serverless Function

Create new app or add to existing:

```typescript
// apps/mcxx/src/handlers/getItemStatus.ts
import { getItemStatusXx } from '@mcbroken/mclogik';
import { prisma } from '@mcbroken/db';

export const handler = async () => {
  await getItemStatusXx(prisma);
  return { statusCode: 200 };
};
```

### 4. Configure Schedule

```typescript
// apps/mcxx/serverless.ts
functions: {
  getItemStatus: {
    handler: 'src/handlers/getItemStatus.handler',
    events: [{ schedule: 'cron(0 * * * ? *)' }],
  },
}
```

### 5. Update Frontend (if needed)

Add country to region selector or map defaults.

---

## Adding a New Tracked Product

### 1. Update Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

model Pos {
  // ... existing fields

  // New product
  newProductCount        Int        @default(0)
  newProductError        Int        @default(0)
  newProductStatus       ItemStatus @default(UNKNOWN)
}
```

### 2. Run Migration

```bash
cd packages/database
pnpm prisma migrate dev --name add_new_product
pnpm turbo run db:generate
```

### 3. Update mclogik Services

```typescript
// packages/mclogik/src/services/getItemStatus/checkForProduct.ts

export async function checkForProduct(store, products) {
  // Add new product check logic
  const newProductAvailable = products.some(p => p.id === 'NEW_PRODUCT_ID');
  return {
    // ... existing
    newProduct: newProductAvailable,
  };
}
```

### 4. Update Frontend Display

Add new product to store popover/list components.

---

## Adding a New Frontend Component

### 1. Create Component

```typescript
// apps/frontend/src/components/NewComponent.tsx
'use client';

import { FC } from 'react';

interface NewComponentProps {
  title: string;
}

export const NewComponent: FC<NewComponentProps> = ({ title }) => {
  return (
    <div className="p-4 rounded-lg bg-card">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
};
```

### 2. Add shadcn/ui Component (if needed)

```bash
cd apps/frontend
npx shadcn@latest add dialog
```

### 3. Create Data Hook (if needed)

```typescript
// apps/frontend/src/hooks/queries/useNewData.ts
import { useQuery } from 'react-query';
import axios from 'axios';

export const useNewData = () => {
  return useQuery({
    queryKey: ['newData'],
    queryFn: async () => {
      const { data } = await axios.get('/api/new-data');
      return data;
    },
  });
};
```

---

## Adding a New Serverless Function

### 1. Create Handler

```typescript
// apps/mcall/src/handlers/newFunction.ts
import type { Handler } from 'aws-lambda';
import { logger } from '@sailplane/logger';

export const handler: Handler = async (event) => {
  logger.info('New function invoked', { event });

  try {
    // Implementation
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    logger.error('Function failed', { error });
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed' }) };
  }
};
```

### 2. Add to serverless.ts

```typescript
// apps/mcall/serverless.ts
functions: {
  // ... existing functions
  newFunction: {
    handler: 'src/handlers/newFunction.handler',
    memorySize: 256,
    timeout: 60,
    events: [
      {
        schedule: {
          rate: 'cron(0 12 * * ? *)', // Daily at noon
          enabled: true,
        },
      },
    ],
  },
}
```

### 3. Test Locally

```bash
cd apps/mcall
pnpm serverless invoke local -f newFunction
```

---

## Adding a New React Query Hook

```typescript
// apps/frontend/src/hooks/queries/useNewQuery.ts
import { useQuery, UseQueryOptions } from 'react-query';
import axios from 'axios';
import type { NewDataType } from '@/types';

const fetchNewData = async (): Promise<NewDataType> => {
  const { data } = await axios.get<NewDataType>('/api/endpoint');
  return data;
};

export const useNewQuery = (
  options?: Omit<UseQueryOptions<NewDataType>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['newData'],
    queryFn: fetchNewData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};
```

---

## Modifying Database Schema

### 1. Edit Schema

```prisma
// packages/database/prisma/schema.prisma
```

### 2. Create Migration

```bash
cd packages/database
pnpm prisma migrate dev --name descriptive_name
```

### 3. Regenerate Client

```bash
pnpm turbo run db:generate
```

### 4. Update Consuming Code

Update TypeScript types and service functions as needed.

---

## Deploying Changes

### Frontend Only

```bash
# Preview deployment
cd apps/frontend
vercel

# Production
vercel --prod
```

### Serverless Only

```bash
# Staging
pnpm --filter @mcbroken/mcall deploy:staging

# Production
pnpm --filter @mcbroken/mcall deploy:production
```

### Database Migrations

```bash
# Production
DATABASE_URL=<prod_url> pnpm turbo run db:deploy
```

### Full Deployment

```bash
# 1. Run quality checks
pnpm turbo run check-types lint test

# 2. Deploy database migrations
DATABASE_URL=<prod_url> pnpm turbo run db:deploy

# 3. Deploy serverless
pnpm turbo run deploy:production --filter="./apps/mc*"

# 4. Deploy frontend (automatic via Vercel Git integration)
git push origin main
```

---

## Debugging Production Issues

### Check Lambda Logs

```bash
# AWS CLI
aws logs tail /aws/lambda/mcbroken-mcall-getAllStores --follow

# Or use AWS Console CloudWatch
```

### Check Vercel Logs

Use Vercel Dashboard → Project → Logs

### Test Locally with Production Data

```bash
# Set production DATABASE_URL temporarily
DATABASE_URL=<prod_url> pnpm --filter @mcbroken/frosty dev
```

### Invoke Lambda Manually

```bash
aws lambda invoke \
  --function-name mcbroken-mcall-getAllStores \
  --payload '{}' \
  response.json
```
