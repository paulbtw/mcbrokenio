# Serverless Patterns

## Handler Structure

### Basic Handler

```typescript
// src/handlers/myHandler.ts
import type { Handler } from 'aws-lambda';
import { logger } from '@sailplane/logger';

export const handler: Handler = async (event) => {
  logger.info('Handler started', { event });

  try {
    // Implementation
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    logger.error('Handler failed', { error });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' }),
    };
  }
};
```

### Handler with Shared Logic

```typescript
// src/handlers/getItemStatus.ts
import type { Handler } from 'aws-lambda';
import { logger } from '@sailplane/logger';
import { getItemStatusUs } from '@mcbroken/mclogik';
import { prisma } from '@mcbroken/db';

export const handler: Handler = async () => {
  logger.info('getItemStatus started');

  try {
    await getItemStatusUs(prisma);
    logger.info('getItemStatus completed');
    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    logger.error('getItemStatus failed', { error });
    throw error; // Let Lambda handle retry
  }
};
```

## Serverless Configuration

### Base Config Extension

```typescript
// serverless.ts
import type { AWS } from '@serverless/typescript';
import baseConfig from '@mcbroken/serverless-config';

const serverlessConfiguration: AWS = {
  ...baseConfig,
  service: 'mcbroken-us',

  provider: {
    ...baseConfig.provider,
    region: 'us-east-2',
    deploymentBucket: {
      name: 'mcbrokenio-mcus-bucket-dev',
    },
    environment: {
      DATABASE_URL: '${env:DATABASE_URL}',
      // ... other env vars
    },
  },

  functions: {
    getItemStatus: {
      handler: 'src/handlers/getItemStatus.handler',
      memorySize: 368,
      timeout: 900,
      events: [
        {
          schedule: {
            rate: 'cron(0,30 * * * ? *)',
            enabled: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
```

### Cron Schedule Patterns

```typescript
// Every hour at minute 0
'cron(0 * * * ? *)'

// Every 30 minutes
'cron(0,30 * * * ? *)'

// Every 15 minutes
'cron(0,15,30,45 * * * ? *)'

// Daily at midnight UTC
'cron(0 0 * * ? *)'

// Weekly on Sunday at midnight
'cron(0 0 ? * SUN *)'

// Monthly on first day
'cron(0 0 1 * ? *)'
```

## Rate Limiting

### Using p-queue

```typescript
import PQueue from 'p-queue';

// Create rate-limited queue
const queue = new PQueue({
  concurrency: 5,        // Max 5 concurrent requests
  interval: 1000,        // Per 1 second
  intervalCap: 5,        // Max 5 requests per interval
});

export async function fetchWithRateLimit<T>(urls: string[]): Promise<T[]> {
  const results = await Promise.all(
    urls.map(url =>
      queue.add(async () => {
        const response = await axios.get<T>(url);
        return response.data;
      })
    )
  );
  return results;
}
```

### Batch Processing

```typescript
import { chunkArray } from '@mcbroken/mclogik';

export async function processBatches(items: Item[]) {
  const batches = chunkArray(items, 100);

  for (const batch of batches) {
    await Promise.all(batch.map(processItem));
    // Add delay between batches if needed
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

## Error Handling

### Retry-Safe Handler

```typescript
export const handler: Handler = async (event, context) => {
  // Prevent Lambda from waiting for event loop
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await processStores();
    return { statusCode: 200 };
  } catch (error) {
    logger.error('Processing failed', { error });

    // Re-throw to trigger Lambda retry
    if (shouldRetry(error)) {
      throw error;
    }

    // Or return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Processing failed' }),
    };
  }
};

function shouldRetry(error: unknown): boolean {
  // Retry on transient errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status === 429 || status === 503;
  }
  return false;
}
```

### Graceful Degradation

```typescript
export async function getStoreStatus(store: Store) {
  try {
    const status = await checkAvailability(store);
    return { ...store, status };
  } catch (error) {
    logger.warn('Failed to check store', { storeId: store.id, error });
    // Return unknown status instead of failing
    return { ...store, status: 'UNKNOWN' };
  }
}
```

## Logging

### Structured Logging

```typescript
import { logger } from '@sailplane/logger';

// Info with context
logger.info('Processing stores', {
  country: 'US',
  storeCount: stores.length,
});

// Warning
logger.warn('Store check failed, skipping', {
  storeId: store.id,
  error: error.message,
});

// Error
logger.error('Critical failure', {
  error,
  context: { country, batchIndex },
});
```

### Log Levels

- `debug`: Development details
- `info`: Normal operations
- `warn`: Recoverable issues
- `error`: Failures requiring attention

## S3 Integration

### Uploading Files

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function uploadToS3(
  key: string,
  data: object,
  contentType = 'application/json'
) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.EXPORT_BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: contentType,
    CacheControl: 'max-age=300', // 5 min cache
  }));
}
```

### GeoJSON Export Pattern

```typescript
export async function generateAndUploadGeoJson(stores: Store[]) {
  const geojson = {
    type: 'FeatureCollection',
    features: stores.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [store.longitude, store.latitude],
      },
      properties: {
        id: store.id,
        name: store.name,
        status: store.milkshakeStatus,
      },
    })),
  };

  await uploadToS3('stores.geojson', geojson);
}
```

## Environment Variables

### Accessing Env Vars

```typescript
// Type-safe env access
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const databaseUrl = getEnvVar('DATABASE_URL');
const apiToken = getEnvVar('BASIC_TOKEN_US');
```

### serverless.ts Environment

```typescript
provider: {
  environment: {
    DATABASE_URL: '${env:DATABASE_URL}',
    MCD_DEVICEID: '${env:MCD_DEVICEID}',
    BASIC_TOKEN_US: '${env:BASIC_TOKEN_US}',
    EXPORT_BUCKET: '${env:EXPORT_BUCKET}',
  },
}
```

## Local Development

### serverless-offline

```bash
# Start local Lambda emulation
cd apps/mcus
pnpm dev
```

### Invoking Locally

```bash
# Basic invoke
pnpm serverless invoke local -f getAllStores

# With data
pnpm serverless invoke local -f getItemStatus --data '{"test": true}'

# With env vars
pnpm serverless invoke local -f getAllStores -e DATABASE_URL=xxx
```

## Deployment

### Deploy Commands

```bash
# Staging
pnpm serverless deploy --stage staging

# Production
pnpm serverless deploy --stage production

# Single function
pnpm serverless deploy function -f getItemStatus
```

### AWS Profile

```bash
# Set profile
export AWS_PROFILE=mcbroken

# Or in serverless.ts
provider: {
  profile: 'mcbroken',
}
```

## Performance Tips

1. **Reuse connections**: Use Prisma singleton
2. **Minimize cold starts**: Keep bundles small
3. **Batch DB operations**: Use `createMany`, `updateMany`
4. **Set appropriate memory**: More memory = faster CPU
5. **Use provisioned concurrency**: For consistent latency
