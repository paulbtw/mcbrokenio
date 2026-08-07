import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { APIType } from '../../types'

import { getBearerToken } from './getBearerToken'

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

vi.mock('../../constants', () => ({
  BASIC_TOKEN_AP: 'ap-client:secret',
  BASIC_TOKEN_EL: 'el-client:secret',
  BASIC_TOKEN_EU: 'eu-client:secret',
  BASIC_TOKEN_US: 'us-client:secret'
}))

describe('getBearerToken', () => {
  it('returns the regional bearer token', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { response: { token: 'bearer-token' } }
    })

    await expect(getBearerToken(APIType.US)).resolves.toBe('bearer-token')
  })

  it('rejects token request failures so the availability poll can retry', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Token endpoint failed'))

    await expect(getBearerToken(APIType.US)).rejects.toThrow(
      'Token endpoint failed'
    )
  })
})
