# Testing Patterns

## Testing Framework

| Package | Framework | Location |
|---------|-----------|----------|
| `@mcbroken/mclogik` | Vitest | `packages/mclogik/tests/` |
| Root | Jest | `jest.config.ts` |

## Running Tests

```bash
# All tests
pnpm turbo run test

# Watch mode (mclogik)
cd packages/mclogik
pnpm test -- --watch

# With coverage
pnpm test -- --coverage

# Specific test file
pnpm test -- path/to/test.test.ts
```

## Vitest Patterns (mclogik)

### Basic Test Structure

```typescript
// services/myService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myService } from './myService';

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process data correctly', async () => {
    const result = await myService(input);
    expect(result).toBe(expected);
  });
});
```

### Mocking Prisma

```typescript
import { vi } from 'vitest';

const mockPrisma = {
  pos: {
    findMany: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  stats: {
    upsert: vi.fn(),
  },
};

// In test
mockPrisma.pos.findMany.mockResolvedValue([
  { id: '1', name: 'Store 1', country: 'US' },
]);

await myService(mockPrisma as any);

expect(mockPrisma.pos.findMany).toHaveBeenCalledWith({
  where: expect.objectContaining({ country: 'US' }),
});
```

### Mocking Axios

```typescript
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

mockedAxios.get.mockResolvedValue({
  data: { stores: [] },
});

// In test
const result = await fetchStores();
expect(mockedAxios.get).toHaveBeenCalledWith(
  expect.stringContaining('/stores'),
  expect.any(Object)
);
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const promise = myAsyncFunction();

  await expect(promise).resolves.toBe(expectedValue);
});

it('should handle errors', async () => {
  mockPrisma.pos.findMany.mockRejectedValue(new Error('DB Error'));

  await expect(myService(mockPrisma)).rejects.toThrow('DB Error');
});
```

### Testing with Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should debounce calls', async () => {
  const callback = vi.fn();
  debouncedFunction(callback);

  vi.advanceTimersByTime(500);

  expect(callback).toHaveBeenCalledTimes(1);
});
```

## Test Organization

### File Naming

- Test files: `*.test.ts`
- Located alongside source files or in `tests/` directory

### Test Categories

```typescript
describe('ServiceName', () => {
  describe('successful operations', () => {
    it('should handle normal input', async () => {});
    it('should handle edge case', async () => {});
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {});
    it('should handle invalid input', async () => {});
  });

  describe('integration', () => {
    it('should work with real dependencies', async () => {});
  });
});
```

## Frontend Testing (Future)

Currently, frontend testing is minimal. Recommended approach:

### Component Testing with Vitest

```typescript
// components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### React Query Testing

```typescript
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useMcData } from './useMcData';

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

it('fetches data', async () => {
  const { result } = renderHook(() => useMcData(), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

## Test Configuration

### Vitest Config (mclogik)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Mock external dependencies**: Don't call real APIs in unit tests
3. **Test behavior, not implementation**: Focus on what the function does
4. **Use descriptive names**: `it('should return empty array when no stores found')`
5. **Clean up**: Use `beforeEach`/`afterEach` for setup/teardown
6. **Run tests before commit**: Husky hooks should enforce this
