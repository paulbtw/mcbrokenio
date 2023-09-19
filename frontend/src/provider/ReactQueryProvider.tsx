'use client'

import { useState, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
