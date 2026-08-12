export type JsonRecord = Record<string, unknown>

/** Marks a structurally invalid response from an upstream service. */
export class InvalidUpstreamResponseError extends Error {
  constructor() {
    super('Upstream response was invalid')
    this.name = 'InvalidUpstreamResponseError'
  }
}

/** Returns an upstream JSON object without trusting its compile-time shape. */
export function getUpstreamRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return undefined
}

function requireUpstreamArray<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item
): Item[] {
  if (!Array.isArray(value) || !value.every(isItem)) {
    throw new InvalidUpstreamResponseError()
  }

  return value
}

/** Validates an untrusted upstream value as a string array. */
export function requireUpstreamStringArray(value: unknown): string[] {
  return requireUpstreamArray(
    value,
    (item): item is string => typeof item === 'string'
  )
}

/** Validates an untrusted upstream value as a number array. */
export function requireUpstreamNumberArray(value: unknown): number[] {
  return requireUpstreamArray(
    value,
    (item): item is number => typeof item === 'number'
  )
}
