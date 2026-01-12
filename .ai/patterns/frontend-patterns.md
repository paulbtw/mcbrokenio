# Frontend Patterns

## Architecture

**Framework**: Next.js 15 with App Router
**Rendering**: Server-first approach with client components where needed

## Component Patterns

### Server vs Client Components

```typescript
// Server Component (default) - no directive needed
// Can access DB, filesystem, run server-only code
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component - requires directive
// Needed for hooks, event handlers, browser APIs
'use client';

import { useState } from 'react';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### When to Use 'use client'

Use client components when you need:
- `useState`, `useEffect`, `useContext`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `document`)
- React Query hooks
- Third-party client libraries (Mapbox, etc.)

### Component Structure

```typescript
// components/MyComponent.tsx
'use client';

// 1. Imports (external, internal, relative)
import { useState, type FC } from 'react';
import { cn } from '@/lib/utils';
import type { MyType } from '@/types';

// 2. Types (if component-specific)
interface MyComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onAction?: () => void;
}

// 3. Component
export const MyComponent: FC<MyComponentProps> = ({
  title,
  variant = 'primary',
  onAction,
}) => {
  // Hooks
  const [isOpen, setIsOpen] = useState(false);

  // Handlers
  const handleClick = () => {
    setIsOpen(true);
    onAction?.();
  };

  // Render
  return (
    <div className={cn(
      'p-4 rounded-lg',
      variant === 'primary' && 'bg-primary text-primary-foreground',
      variant === 'secondary' && 'bg-secondary',
    )}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={handleClick}>Open</button>
    </div>
  );
};
```

## React Query Patterns

### Basic Query Hook

```typescript
// hooks/queries/useMcData.ts
import { useQuery } from 'react-query';
import axios from 'axios';
import type { StoreData } from '@/types';

const fetchMcData = async (): Promise<StoreData[]> => {
  const { data } = await axios.get<StoreData[]>('/api/stores');
  return data;
};

export const useMcData = () => {
  return useQuery({
    queryKey: ['mcData'],
    queryFn: fetchMcData,
    staleTime: 5 * 60 * 1000,     // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
```

### Query with Parameters

```typescript
export const useStoresByCountry = (country: string) => {
  return useQuery({
    queryKey: ['stores', country],
    queryFn: () => fetchStores(country),
    enabled: !!country, // Only fetch if country is defined
  });
};
```

### Using Query Hooks

```typescript
'use client';

import { useMcData } from '@/hooks/queries/useMcData';

export function StoreList() {
  const { data, isLoading, error } = useMcData();

  if (isLoading) return <Skeleton />;
  if (error) return <div>Error loading stores</div>;

  return (
    <ul>
      {data?.map(store => (
        <li key={store.id}>{store.name}</li>
      ))}
    </ul>
  );
}
```

## TailwindCSS Patterns

### Using cn() Utility

```typescript
import { cn } from '@/lib/utils';

// Basic usage
<div className={cn('base-classes', condition && 'conditional-class')} />

// Multiple conditions
<button className={cn(
  'px-4 py-2 rounded font-medium',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200',
  disabled && 'opacity-50 cursor-not-allowed',
  className // Allow override from props
)} />
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  p-4              // Base (mobile)
  md:p-6           // Medium screens
  lg:p-8           // Large screens
">
  <h1 className="text-xl md:text-2xl lg:text-3xl">
    Responsive Title
  </h1>
</div>
```

### Dark Mode

```typescript
// Uses CSS variables defined in globals.css
<div className="bg-background text-foreground">
  <div className="bg-card border border-border rounded-lg">
    Content
  </div>
</div>
```

## shadcn/ui Patterns

### Adding Components

```bash
cd apps/frontend
npx shadcn@latest add button dialog card
```

### Using Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline">Click Me</Button>
      </CardContent>
    </Card>
  );
}
```

## Map Integration

### Mapbox Setup

```typescript
'use client';

import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapComponent() {
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 10,
  });

  return (
    <Map
      {...viewport}
      onMove={evt => setViewport(evt.viewState)}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{ width: '100%', height: '100%' }}
    >
      <Marker latitude={40.7128} longitude={-74.006}>
        <div className="w-4 h-4 bg-red-500 rounded-full" />
      </Marker>
    </Map>
  );
}
```

### Dynamic Import for SSR

```typescript
// Mapbox requires browser APIs, use dynamic import
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);
```

## Layout Patterns

### App Layout

```typescript
// app/layout.tsx
import { ReactQueryProvider } from '@/provider/ReactQueryProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### Page Structure

```typescript
// app/page.tsx
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MainContent } from '@/components/MainContent';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MainContent />
      </main>
      <Footer />
    </div>
  );
}
```

## Hooks Patterns

### Custom Hook Structure

```typescript
// hooks/useSettings.ts
'use client';

import { useState, useCallback } from 'react';

interface Settings {
  showUnavailable: boolean;
  selectedCountry: string;
}

export const useSettings = (defaults: Partial<Settings> = {}) => {
  const [settings, setSettings] = useState<Settings>({
    showUnavailable: false,
    selectedCountry: 'US',
    ...defaults,
  });

  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return { settings, updateSetting };
};
```

### Debounce Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Error Handling

### Error Boundary

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Loading States

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingCard() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
```
