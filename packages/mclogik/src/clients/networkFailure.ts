import axios from 'axios'

import { getUpstreamRecord } from './upstreamResponse'

const MAX_DIAGNOSTIC_FIELD_LENGTH = 120
const SAFE_DIAGNOSTIC_IDENTIFIER = /^[A-Za-z0-9_.:-]+$/
const SENSITIVE_DIAGNOSTIC_CONTENT =
  /authorization|bearer|credential|https?:|secret|token/i

/** Marks a structurally invalid response from an upstream service. */
export class InvalidUpstreamResponseError extends Error {
  constructor() {
    super('Upstream response was invalid')
    this.name = 'InvalidUpstreamResponseError'
  }
}

export type NetworkFailureKind =
  'http' | 'invalid-response' | 'network' | 'timeout'

export interface NetworkFailure {
  kind: NetworkFailureKind
  retryable: boolean
  status?: number
  code?: string
  type?: string
  service?: string
  message: string
}

/** A sanitized, typed batch-wide upstream failure safe to cross a workflow seam. */
export class NetworkFailureError extends Error implements NetworkFailure {
  readonly kind: NetworkFailureKind
  readonly retryable: boolean
  readonly status?: number
  readonly code?: string
  readonly type?: string
  readonly service?: string

  constructor(message: string, failure: NetworkFailure) {
    super(message)
    this.name = 'NetworkFailureError'
    this.kind = failure.kind
    this.retryable = failure.retryable
    this.status = failure.status
    this.code = failure.code
    this.type = failure.type
    this.service = failure.service
  }
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

function getNetworkFailureKind(
  status: number | undefined,
  transportCode: string | undefined
): NetworkFailureKind {
  if (status != null) {
    return 'http'
  }

  if (transportCode === 'ECONNABORTED' || transportCode === 'ETIMEDOUT') {
    return 'timeout'
  }

  return 'network'
}

function getNetworkFailureMessage(kind: NetworkFailureKind): string {
  if (kind === 'http') {
    return 'Upstream HTTP request failed'
  }

  if (kind === 'timeout') {
    return 'Upstream request timed out'
  }

  if (kind === 'invalid-response') {
    return 'Upstream response was invalid'
  }

  return 'Upstream network request failed'
}

/**
 * Converts an expected Axios request failure to the strict diagnostic allowlist.
 * Raw errors, URLs, headers, response bodies, and credential-bearing messages
 * never cross the workflow network boundary.
 */
export function createNetworkFailure(
  error: unknown
): NetworkFailure | undefined {
  if (error instanceof InvalidUpstreamResponseError) {
    return createInvalidResponseFailure()
  }

  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const status = error.response?.status
  const responseData = getUpstreamRecord(error.response?.data)
  const statusData = getUpstreamRecord(responseData?.status)
  const transportCode = getBoundedIdentifier(error.code)
  const code = getBoundedIdentifier(statusData?.code) ?? transportCode
  const type = getBoundedIdentifier(statusData?.type)
  const service = getBoundedIdentifier(statusData?.service)
  const kind = getNetworkFailureKind(status, transportCode)

  return {
    kind,
    retryable: isRetryableStatus(status),
    ...(status != null ? { status } : {}),
    ...(code != null ? { code } : {}),
    ...(type != null ? { type } : {}),
    ...(service != null ? { service } : {}),
    message: getNetworkFailureMessage(kind)
  }
}

/** Creates the safe diagnostic used for an invalid upstream payload. */
export function createInvalidResponseFailure(): NetworkFailure {
  return {
    kind: 'invalid-response',
    retryable: true,
    message: 'Upstream response was invalid'
  }
}
