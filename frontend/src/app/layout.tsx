import '@/app/globals.css'
import { ReactQueryProvider } from '@/provider/ReactQueryProvider'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { type PropsWithChildren } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mcbroken.io 🥤',
  description: "Tracking the McDonald's ice and milchshake status",
  viewport: 'initial-scale=1.0, width=device-width',
  metadataBase: new URL('https://mcbroken.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mcbroken.io',
    title: 'Mcbroken.io 🥤',
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
    title: 'Mcbroken.io 🥤'
  }
}

export default function RootLayout({
  children
}: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={clsx('w-screen h-screen flex items-center', inter.className)}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
