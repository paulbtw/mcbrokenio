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

  it('starts EL refresh even when the EU refresh rejects', async () => {
    mocks.refreshStoreCatalog
      .mockRejectedValueOnce(new Error('EU unavailable'))
      .mockResolvedValueOnce({})

    await expect(
      handler({} as never, {} as never, vi.fn())
    ).rejects.toThrow('EU unavailable')

    expect(mocks.refreshStoreCatalog).toHaveBeenCalledTimes(2)
    expect(mocks.refreshStoreCatalog).toHaveBeenNthCalledWith(1, {
      apiType: APIType.EU
    })
    expect(mocks.refreshStoreCatalog).toHaveBeenNthCalledWith(2, {
      apiType: APIType.EL
    })
  })
})
