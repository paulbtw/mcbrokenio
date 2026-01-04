'use client'

import { type PropsWithChildren, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
