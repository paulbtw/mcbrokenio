import axios from 'axios'

const MAX_DIAGNOSTIC_FIELD_LENGTH = 120
const SAFE_DIAGNOSTIC_IDENTIFIER = /^[A-Za-z0-9_.:-]+$/
const SENSITIVE_DIAGNOSTIC_CONTENT =
  /authorization|bearer|credential|https?:|secret|token/i

type JsonRecord = Record<string, unknown>

export type NetworkFailureKind =
  | 'http'
  | 'invalid-response'
  | 'network'
  | 'timeout'

export interface NetworkFailure {
  kind: NetworkFailureKind
  retryable: boolean
  status?: number
  code?: string
  type?: string
  service?: string
  message: string
}

function getRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}

function getBoundedIdentifier(value: unknown): string | undefined {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    return undefined
  }

  const identifier = String(value).slice(0, MAX_DIAGNOSTIC_FIELD_LENGTH)

  if (
    !SAFE_DIAGNOSTIC_IDENTIFIER.test(identifier) ||
    SENSITIVE_DIAGNOSTIC_CONTENT.test(identifier)
  ) {
    return undefined
  }

  return identifier
}

function isRetryableStatus(status: number | undefined): boolean {
  return status == null || status === 408 || status === 429 || status >= 500
}

/**
 * Converts an expected Axios request failure to the strict diagnostic allowlist.
 * Raw errors, URLs, headers, response bodies, and credential-bearing messages
 * never cross the workflow network boundary.
 */
export function createNetworkFailure(
  error: unknown
): NetworkFailure | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const status = error.response?.status
  const responseData = getRecord(error.response?.data)
  const statusData = getRecord(responseData?.status)
  const transportCode = getBoundedIdentifier(error.code)
  const code = getBoundedIdentifier(statusData?.code) ?? transportCode
  const type = getBoundedIdentifier(statusData?.type)
  const service = getBoundedIdentifier(statusData?.service)
  const timedOut =
    transportCode === 'ECONNABORTED' || transportCode === 'ETIMEDOUT'
  const kind: NetworkFailureKind =
    status != null ? 'http' : timedOut ? 'timeout' : 'network'

  return {
    kind,
    retryable: isRetryableStatus(status),
    ...(status != null ? { status } : {}),
    ...(code != null ? { code } : {}),
    ...(type != null ? { type } : {}),
    ...(service != null ? { service } : {}),
    message:
      kind === 'http'
        ? 'Upstream HTTP request failed'
        : kind === 'timeout'
          ? 'Upstream request timed out'
          : 'Upstream network request failed'
  }
}

export function createInvalidResponseFailure(): NetworkFailure {
  return {
    kind: 'invalid-response',
    retryable: true,
    message: 'Upstream response was invalid'
  }
}
