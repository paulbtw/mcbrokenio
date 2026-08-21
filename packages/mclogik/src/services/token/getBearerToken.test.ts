import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidUpstreamResponseError } from '../../clients/networkFailure'
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

function createReadTimeoutError() {
  return Object.assign(new Error('read ETIMEDOUT'), {
    code: 'ETIMEDOUT'
  })
}

function createAxiosTimeoutError() {
  return Object.assign(new Error('timeout of 10000ms exceeded'), {
    code: 'ECONNABORTED'
  })
}

describe('getBearerToken', () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the regional bearer token', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { response: { token: 'bearer-token' } }
    })

    await expect(getBearerToken(APIType.US)).resolves.toBe('bearer-token')
    expect(axios.post).toHaveBeenCalledWith(
      'https://us-prod.api.mcd.com/v1/security/auth/token',
      null,
      {
        headers: {
          authorization: 'Basic us-client:secret',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'mcbroken/1.0'
        },
        timeout: 10_000
      }
    )
  })

  it('retries a transient read timeout before failing the availability poll', async () => {
    vi.useFakeTimers()
    const timeoutError = createReadTimeoutError()
    vi.mocked(axios.post)
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce({
        data: { response: { token: 'bearer-token' } }
      })

    const tokenPromise = getBearerToken(APIType.US)

    await vi.runAllTimersAsync()

    await expect(tokenPromise).resolves.toBe('bearer-token')
    expect(axios.post).toHaveBeenCalledTimes(2)
  })

  it('retries a configured Axios timeout before failing the availability poll', async () => {
    vi.useFakeTimers()
    const timeoutError = createAxiosTimeoutError()
    vi.mocked(axios.post)
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce({
        data: { response: { token: 'bearer-token' } }
      })

    const tokenPromise = getBearerToken(APIType.US)

    await vi.runAllTimersAsync()

    await expect(tokenPromise).resolves.toBe('bearer-token')
    expect(axios.post).toHaveBeenCalledTimes(2)
  })

  it('rejects after exhausting read timeout retries', async () => {
    vi.useFakeTimers()
    const timeoutError = createReadTimeoutError()
    vi.mocked(axios.post).mockRejectedValue(timeoutError)

    const tokenPromise = getBearerToken(APIType.US)
    const rejection = expect(tokenPromise).rejects.toBe(timeoutError)

    await vi.runAllTimersAsync()

    await rejection
    expect(axios.post).toHaveBeenCalledTimes(3)
  })

  it('rejects token request failures so the availability poll can retry', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Token endpoint failed'))

    await expect(getBearerToken(APIType.US)).rejects.toThrow(
      'Token endpoint failed'
    )
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it.each([null, 'invalid'])(
    'rejects a malformed token response body',
    async (data) => {
      vi.mocked(axios.post).mockResolvedValue({ data })

      await expect(getBearerToken(APIType.US)).rejects.toBeInstanceOf(
        InvalidUpstreamResponseError
      )
      expect(axios.post).toHaveBeenCalledTimes(1)
    }
  )
})
