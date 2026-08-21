import { MCDONALDS_USER_AGENT } from '@mcbroken/mclogik/constants'
import { describe, expect, it } from 'vitest'

describe('@mcbroken/mclogik/constants', () => {
  it('exports the stable McDonalds request identity', () => {
    expect(MCDONALDS_USER_AGENT).toBe('mcbroken/1.0')
  })
})
