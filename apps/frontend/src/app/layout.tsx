import { type PropsWithChildren } from 'react'
import { Analytics } from '@vercel/analytics/react'
import clsx from 'clsx'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ReactQueryProvider } from '@/provider/ReactQueryProvider'

import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'McDonalds Ice Maschine Status 🥤',
  description: "Tracking the McDonald's ice and milchshake status",
  alternates: {
    canonical: '/'
  },
  metadataBase: new URL('https://mcbroken.vatiche.de'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mcbroken.vatiche.de',
    title: 'McDonalds Ice Maschine Status 🥤',
    description: "Tracking the McDonald's ice and milchshake status",
    images: [
      {
        url: '/mcbroken.png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    description: "Tracking the McDonald's ice and milchshake status",
    title: 'McDonalds Ice Maschine Status 🥤'
  }
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width'
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={clsx('bg-slate-100', inter.className)}>
        <ReactQueryProvider>
          <main className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6">
              <Header />
              {children}
              <Footer />
            </div>
          </main>
        </ReactQueryProvider>

        <Analytics />
      </body>
    </html>
  )
}
