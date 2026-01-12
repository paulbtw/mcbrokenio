# Code Conventions

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `MapComponent.tsx` |
| Hooks | camelCase with `use` prefix | `useMcData.ts` |
| Services | camelCase | `getItemStatus.ts` |
| Utilities | camelCase | `chunkArray.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `StoreData` |
| Enums | PascalCase | `Status` |
| Files (general) | camelCase | `generateGeoJson.ts` |
| Folders | camelCase | `getAllStores/` |
| CSS classes | kebab-case (via Tailwind) | `bg-blue-500` |

## File Organization

### Frontend

```
src/
├── app/           # App Router pages
├── components/    # React components
│   ├── ui/        # shadcn/ui primitives
│   └── [Feature]/ # Feature-specific components
├── hooks/         # Custom hooks
│   └── queries/   # React Query hooks
├── lib/           # Utilities
├── provider/      # Context providers
└── types/         # TypeScript types
```

### Serverless

```
src/
└── handlers/      # Lambda handlers (one per file)
```

### Shared Package (mclogik)

```
src/
├── services/      # Business logic (subdirectories by feature)
├── constants/     # Configuration & constants
└── utils/         # Utility functions
```

## Import Order

Enforced by `eslint-plugin-simple-import-sort`:

```typescript
// 1. External dependencies (node_modules)
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import type { Handler } from 'aws-lambda';

// 2. Internal packages (monorepo)
import { prisma } from '@mcbroken/db';
import { getAllStoresService } from '@mcbroken/mclogik';

// 3. Relative imports
import { MyComponent } from './MyComponent';
import type { MyType } from '../types';
```

## Type Imports

Use `import type` for type-only imports:

```typescript
// Correct
import type { Pos } from '@mcbroken/db';
import { prisma } from '@mcbroken/db';

// Incorrect
import { Pos, prisma } from '@mcbroken/db';
```

## TypeScript Patterns

### Interface vs Type

```typescript
// Use interfaces for objects that may be extended
export interface Store {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Use types for unions, intersections, mapped types
export type Status =
  | 'AVAILABLE'
  | 'PARTIAL_AVAILABLE'
  | 'UNAVAILABLE'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';

export type StoreWithStatus = Store & {
  milkshakeStatus: Status;
};
```

### Const Assertions

```typescript
// Use const assertion for literal types
export const REGIONS = ['US', 'EU', 'AU', 'EL'] as const;
export type Region = typeof REGIONS[number]; // 'US' | 'EU' | 'AU' | 'EL'

// For configuration objects
export const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
} as const;
```

### Function Types

```typescript
// Named function
export function processStore(store: Store): ProcessedStore {
  // ...
}

// Arrow function for callbacks
const handleClick = (event: MouseEvent) => {
  // ...
};

// Async function
export async function fetchStores(): Promise<Store[]> {
  // ...
}
```

### Error Handling Types

```typescript
// Custom error class
export class McBrokenError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'McBrokenError';
  }
}
```

## Module System

| Package | Module Type | Why |
|---------|-------------|-----|
| Frontend (`@mcbroken/frosty`) | ESM | Next.js standard |
| Shared logic (`@mcbroken/mclogik`) | ESM | Modern package |
| Database (`@mcbroken/db`) | ESM | Prisma modern setup |
| Serverless (`@mcbroken/mc*`) | CommonJS | Lambda compatibility |

## Code Style

### Line Length

- Max 100 characters (soft limit)
- Break long lines for readability

### Spacing

```typescript
// Object destructuring with spaces
const { name, status } = store;

// Array destructuring
const [first, second] = items;

// Function parameters
function process(a: string, b: number): void {
  // ...
}
```

### Trailing Commas

```typescript
// Use trailing commas in multiline
const config = {
  name: 'value',
  other: 'value',  // ← trailing comma
};

const items = [
  'one',
  'two',
  'three',  // ← trailing comma
];
```

## React Conventions

### Component Props

```typescript
// Use interface for props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
}

// Use FC type (optional)
export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
}) => {
  // ...
};
```

### Event Handlers

```typescript
// Prefix with 'handle'
const handleClick = () => {};
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: FormEvent) => {};
```

### State

```typescript
// Descriptive state names
const [isLoading, setIsLoading] = useState(false);
const [selectedStore, setSelectedStore] = useState<Store | null>(null);
const [stores, setStores] = useState<Store[]>([]);
```

## Comments

### When to Comment

- Complex business logic
- Non-obvious decisions
- TODO items with context

### Comment Style

```typescript
// Single-line for brief explanations

/**
 * Multi-line for complex explanations
 * that need more detail.
 */

// TODO: Add retry logic for rate limiting
// FIXME: Handle edge case when store has no coordinates
```

### JSDoc (for exported functions)

```typescript
/**
 * Processes stores and updates their availability status.
 *
 * @param prisma - Prisma client instance
 * @param country - Country code to process
 * @returns Number of stores processed
 */
export async function processStores(
  prisma: PrismaClient,
  country: string
): Promise<number> {
  // ...
}
```

## Anti-Patterns to Avoid

```typescript
// ❌ Don't use `any`
function process(data: any) {}

// ✅ Use proper types or `unknown`
function process(data: unknown) {}

// ❌ Don't mutate parameters
function addItem(items: Item[]) {
  items.push(newItem);
}

// ✅ Return new array
function addItem(items: Item[]): Item[] {
  return [...items, newItem];
}

// ❌ Don't use nested ternaries
const result = a ? b ? c : d : e;

// ✅ Use if/else or early returns
if (!a) return e;
return b ? c : d;

// ❌ Don't use magic numbers
if (status === 1) {}

// ✅ Use named constants
const STATUS_ACTIVE = 1;
if (status === STATUS_ACTIVE) {}
```
