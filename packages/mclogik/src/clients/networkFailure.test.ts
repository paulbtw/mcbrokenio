import { describe, expect, it } from 'vitest'

import {
  createNetworkFailure,
  InvalidUpstreamResponseError
} from './networkFailure'

function createAxiosFailure(input: {
  code?: string
  status?: number
  data?: unknown
}): unknown {
  return {
    name: 'AxiosError',
    message: 'raw upstream error',
    isAxiosError: true,
    code: input.code,
    response:
      input.status == null
        ? undefined
        : { status: input.status, data: input.data },
    toJSON: () => ({})
  }
}

describe('createNetworkFailure', () => {
  it('classifies timeouts without exposing raw transport details', () => {
    expect(
      createNetworkFailure(createAxiosFailure({ code: 'ETIMEDOUT' }))
    ).toEqual({
      kind: 'timeout',
      retryable: true,
      code: 'ETIMEDOUT',
      message: 'Upstream request timed out'
    })
  })

  it('classifies other transport failures as retryable network failures', () => {
    expect(
      createNetworkFailure(createAxiosFailure({ code: 'ECONNRESET' }))
    ).toEqual({
      kind: 'network',
      retryable: true,
      code: 'ECONNRESET',
      message: 'Upstream network request failed'
    })
  })

  it.each(['ERR_INVALID_URL', 'ERR_BAD_OPTION', 'ERR_NOT_SUPPORT'])(
    'leaves the Axios configuration defect %s unclassified',
    (code) => {
      expect(createNetworkFailure(createAxiosFailure({ code }))).toBeUndefined()
    }
  )

  it('leaves response-less Axios errors without a transport code unclassified', () => {
    expect(createNetworkFailure(createAxiosFailure({}))).toBeUndefined()
  })

  it.each([
    [400, false],
    [408, true],
    [429, true],
    [503, true]
  ])('classifies HTTP %i retryability', (status, retryable) => {
    expect(createNetworkFailure(createAxiosFailure({ status }))).toEqual({
      kind: 'http',
      retryable,
      status,
      message: 'Upstream HTTP request failed'
    })
  })

  it('keeps only bounded, non-sensitive diagnostic identifiers', () => {
    const failure = createNetworkFailure(
      createAxiosFailure({
        status: 503,
        code: 'ERR_NETWORK',
        data: {
          status: {
            code: 'Bearer-secret',
            type: 'https://private.example',
            service: 'catalog_service'
          }
        }
      })
    )

    expect(failure).toEqual({
      kind: 'http',
      retryable: true,
      status: 503,
      code: 'ERR_NETWORK',
      service: 'catalog_service',
      message: 'Upstream HTTP request failed'
    })
    expect(failure).not.toHaveProperty('type')
  })

  it('maps explicitly invalid payloads but leaves programming defects alone', () => {
    expect(createNetworkFailure(new InvalidUpstreamResponseError())).toEqual({
      kind: 'invalid-response',
      retryable: true,
      message: 'Upstream response was invalid'
    })
    expect(createNetworkFailure(new TypeError('bug'))).toBeUndefined()
  })
})
