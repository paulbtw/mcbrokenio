import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mcbroken.io 🥤',
  description: "Tracking the McDonald's ice and milchshake status",
  viewport: 'initial-scale=1.0, width=device-width',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mcbroken.io',
    title: 'Mcbroken.io 🥤',
    description: "Tracking the McDonald's ice and milchshake status",
    images: [
      {
        url: 'https://mcbroken.io/mcbroken.png'
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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
