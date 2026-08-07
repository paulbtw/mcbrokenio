import { APIType } from '@mcbroken/mclogik/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  refreshStoreCatalog: vi.fn(),
  initSentry: vi.fn()
}))

vi.mock('@mcbroken/mclogik/sentry', () => ({
  initSentry: mocks.initSentry,
  wrapHandler: (handler: unknown) => handler
}))

vi.mock('@mcbroken/mclogik/storeCatalogRefresh', () => ({
  refreshStoreCatalog: mocks.refreshStoreCatalog
}))

import { handler } from './index'

describe('getAllStores handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('waits for EL refresh before propagating an EU failure', async () => {
    let completeElRefresh!: () => void
    const elRefresh = new Promise<void>((resolve) => {
      completeElRefresh = resolve
    })
    const euFailure = new Error('EU unavailable')
    mocks.refreshStoreCatalog
      .mockRejectedValueOnce(euFailure)
      .mockReturnValueOnce(elRefresh)

    const invocation = Promise.resolve(
      handler({} as never, {} as never, vi.fn())
    )
    const invocationOutcome = invocation.then(
      () => ({ status: 'fulfilled' as const }),
      (error: unknown) => ({ status: 'rejected' as const, error })
    )
    const settlementBeforeEl = await Promise.race([
      invocationOutcome.then(() => 'settled'),
      new Promise<'pending'>((resolve) => {
        setTimeout(() => resolve('pending'), 0)
      })
    ])

    expect(mocks.refreshStoreCatalog).toHaveBeenCalledTimes(2)
    expect(mocks.refreshStoreCatalog).toHaveBeenNthCalledWith(1, {
      apiType: APIType.EU
    })
    expect(mocks.refreshStoreCatalog).toHaveBeenNthCalledWith(2, {
      apiType: APIType.EL
    })
    expect(settlementBeforeEl).toBe('pending')

    completeElRefresh()

    await expect(invocationOutcome).resolves.toEqual({
      status: 'rejected',
      error: euFailure
    })
  })
})
