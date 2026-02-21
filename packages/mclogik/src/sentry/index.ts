import * as Sentry from '@sentry/aws-serverless'

// Ensures Sentry.init() is only called once per Lambda container
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
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production',
    initialScope: {
      tags: { region: config.region },
    },
  })
}

export const wrapHandler = Sentry.wrapHandler

export { Sentry }

// --- Batch summary helpers ---

interface CountryStats {
  total: number
  failed: number
}

export interface BatchSummary {
  apiType: string
  totalStores: number
  successCount: number
  failedCount: number
  countryBreakdown: Record<string, CountryStats>
  durationMs: number
}

/**
 * Send a Sentry event summarizing a batch processing run.
 * Only fires when failure rate exceeds 10% or any country is fully down.
 */
export function captureBatchSummary(summary: BatchSummary): void {
  const { totalStores, failedCount, countryBreakdown, apiType } = summary

  if (totalStores === 0) return

  const failureRate = failedCount / totalStores

  const countriesFullyDown = Object.entries(countryBreakdown)
    .filter(([, stats]) => stats.failed === stats.total && stats.total > 0)
    .map(([country]) => country)

  if (failureRate <= 0.1 && countriesFullyDown.length === 0) return

  const level = countriesFullyDown.length > 0 ? 'error' : 'warning'

  const message =
    countriesFullyDown.length > 0
      ? `${apiType} batch: ${countriesFullyDown.join(', ')} fully down (${failedCount}/${totalStores} failed)`
      : `${apiType} batch: high failure rate ${(failureRate * 100).toFixed(1)}% (${failedCount}/${totalStores} failed)`

  Sentry.withScope((scope) => {
    scope.setTag('api_type', apiType)
    scope.setLevel(level)
    scope.setFingerprint([apiType, 'batch-failure'])
    scope.setContext('batch_summary', {
      totalStores,
      successCount: summary.successCount,
      failedCount,
      failureRate: `${(failureRate * 100).toFixed(1)}%`,
      durationMs: summary.durationMs,
      countriesFullyDown,
    })
    scope.setContext('country_breakdown', countryBreakdown)

    Sentry.captureMessage(message, level)
  })
}

/**
 * Add a breadcrumb to the current Sentry scope for tracing processing flow.
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, string | number | boolean>
): void {
  Sentry.addBreadcrumb({
    category: 'mcbroken',
    message,
    data,
    level: 'info',
  })
}
