export type JsonRecord = Record<string, unknown>

/** Returns an upstream JSON object without trusting its compile-time shape. */
export function getUpstreamRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}
