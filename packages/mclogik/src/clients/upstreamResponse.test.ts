import { describe, expect, it } from 'vitest'

import { InvalidUpstreamResponseError } from './networkFailure'
import {
  requireUpstreamNumberArray,
  requireUpstreamStringArray
} from './upstreamResponse'

describe('upstream response validators', () => {
  it('accepts homogeneous string and number arrays', () => {
    expect(requireUpstreamStringArray(['one', 'two'])).toEqual(['one', 'two'])
    expect(requireUpstreamNumberArray([1, 2])).toEqual([1, 2])
  })

  it.each([undefined, null, {}, ['one', 2]])(
    'rejects %j as an upstream string array',
    (value) => {
      expect(() => requireUpstreamStringArray(value)).toThrow(
        InvalidUpstreamResponseError
      )
    }
  )

  it.each([undefined, null, {}, [1, 'two']])(
    'rejects %j as an upstream number array',
    (value) => {
      expect(() => requireUpstreamNumberArray(value)).toThrow(
        InvalidUpstreamResponseError
      )
    }
  )
})
