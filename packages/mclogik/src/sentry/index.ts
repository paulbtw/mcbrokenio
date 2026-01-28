import * as Sentry from '@sentry/aws-serverless'

let initializationAttempted = false

export type Region = 'eu' | 'us' | 'au'

interface SentryConfig {
  region: Region
}

export function initSentry(config: SentryConfig): void {
  if (initializationAttempted) return
  initializationAttempted = true

  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    console.warn('SENTRY_DSN not set, error tracking disabled')
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    initialScope: {
      tags: { region: config.region },
    },
  })
}

export const wrapHandler = Sentry.wrapHandler

export { Sentry }
