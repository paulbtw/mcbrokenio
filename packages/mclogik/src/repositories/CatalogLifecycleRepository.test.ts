import { describe, expect, it, vi } from 'vitest'

import { PrismaCatalogLifecycleRepository } from './CatalogLifecycleRepository'

function createStore(id = 'US-1') {
  return {
    id,
    nationalStoreNumber: id.split('-')[1]!,
    name: `Store ${id}`,
    latitude: '40',
    longitude: '-70',
    hasMobileOrdering: true,
    country: 'US'
  }
}

function createPrismaMock() {
  const prisma = {
    $executeRaw: vi.fn().mockResolvedValue(1),
    $queryRaw: vi.fn().mockResolvedValue([{ locked: 1 }]),
    $transaction: vi.fn(),
    catalogRefreshCycle: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValue({
          cycleId: '2026-07-26',
          observedStoreCount: 100
        })
    },
    catalogRefreshScope: {
      upsert: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(1)
    },
    pos: {
      count: vi.fn().mockResolvedValue(0),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    }
  }

  prisma.$transaction.mockImplementation(async (input: unknown) => {
    if (Array.isArray(input)) {
      return Promise.all(input)
    }

    return (input as (tx: typeof prisma) => Promise<unknown>)(prisma)
  })

  return prisma
}

const OBSERVED_AT = new Date('2026-08-08T10:00:00.000Z')

describe('PrismaCatalogLifecycleRepository', () => {
  it('allows catalog reconciliation to run beyond Prisma default transaction timeout', async () => {
    const prisma = createPrismaMock()
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: false,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 120_000
    })
  })

  it('records observations but does not complete or reconcile a partial scope refresh', async () => {
    const prisma = createPrismaMock()
    prisma.pos.deleteMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: false,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1)
    const observationSql = JSON.stringify(prisma.$executeRaw.mock.calls)
    expect(observationSql).not.toContain('updatedAt')
    expect(observationSql).toContain('lastCatalogSeenCycle')
    expect(observationSql).toContain('missingCatalogCycles')
    expect(observationSql).toContain('lastMissingCatalogCycle')
    expect(observationSql).toContain('closedAt')
    expect(observationSql).toContain('EXCLUDED')
    expect(observationSql).toContain('>=')
    expect(prisma.catalogRefreshScope.upsert).not.toHaveBeenCalled()
    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(result).toEqual({
      storesPersisted: 1,
      scopeCompleted: false,
      cycleFinalized: false,
      reconciliationSkipped: false,
      storesMarkedMissing: 0,
      storesClosed: 0,
      storesPurged: 1
    })
  })

  it('waits for every expected scope before advancing missing stores', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshScope.count.mockResolvedValue(1)
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.catalogRefreshScope.upsert).toHaveBeenCalledTimes(1)
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1)
    expect(prisma.catalogRefreshCycle.updateMany).not.toHaveBeenCalled()
    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(result.scopeCompleted).toBe(true)
    expect(result.cycleFinalized).toBe(false)
  })

  it('closes stores after three complete missing cycles and purges old closures', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.pos.count.mockResolvedValueOnce(100).mockResolvedValueOnce(95)
    prisma.pos.updateMany
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 3 })
      .mockResolvedValueOnce({ count: 0 })
    prisma.pos.deleteMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.catalogRefreshCycle.updateMany).toHaveBeenCalledWith({
      where: {
        cycleId: '2026-08-02',
        country: 'US',
        OR: [{ finalizedAt: null }, { reconciliationSkipped: true }]
      },
      data: { finalizedAt: OBSERVED_AT }
    })
    expect(prisma.pos.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        country: 'US',
        closedAt: null,
        missingCatalogCycles: { gte: 2 },
        lastMissingCatalogCycle: '2026-07-26',
        OR: [
          { lastCatalogSeenCycle: null },
          { lastCatalogSeenCycle: { lt: '2026-08-02' } }
        ]
      },
      data: {
        missingCatalogCycles: 3,
        lastMissingCatalogCycle: '2026-08-02',
        closedAt: OBSERVED_AT
      }
    })
    expect(prisma.pos.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        country: 'US',
        closedAt: null,
        missingCatalogCycles: { lt: 2 },
        lastMissingCatalogCycle: '2026-07-26',
        OR: [
          { lastCatalogSeenCycle: null },
          { lastCatalogSeenCycle: { lt: '2026-08-02' } }
        ]
      },
      data: {
        missingCatalogCycles: { increment: 1 },
        lastMissingCatalogCycle: '2026-08-02'
      }
    })
    expect(prisma.pos.updateMany).toHaveBeenNthCalledWith(3, {
      where: {
        country: 'US',
        closedAt: null,
        AND: [
          {
            OR: [
              { lastCatalogSeenCycle: null },
              { lastCatalogSeenCycle: { lt: '2026-08-02' } }
            ]
          },
          {
            OR: [
              { lastMissingCatalogCycle: null },
              { lastMissingCatalogCycle: { not: '2026-07-26' } }
            ]
          }
        ]
      },
      data: {
        missingCatalogCycles: 1,
        lastMissingCatalogCycle: '2026-08-02'
      }
    })
    expect(prisma.pos.deleteMany).toHaveBeenCalledWith({
      where: {
        country: 'US',
        closedAt: {
          lte: new Date('2026-05-10T10:00:00.000Z')
        }
      }
    })
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: false,
      storesMarkedMissing: 3,
      storesClosed: 2,
      storesPurged: 1
    })
  })

  it('skips missing-store reconciliation when catalog coverage drops below the safety threshold', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.pos.count.mockResolvedValueOnce(100).mockResolvedValueOnce(60)
    prisma.pos.deleteMany.mockResolvedValue({ count: 1 })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(prisma.catalogRefreshCycle.update).toHaveBeenCalledWith({
      where: {
        cycleId_country: { cycleId: '2026-08-02', country: 'US' }
      },
      data: {
        reconciliationSkipped: true,
        knownStoreCount: 100,
        observedStoreCount: 60
      }
    })
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: true,
      storesMarkedMissing: 0,
      storesClosed: 0,
      storesPurged: 1
    })
  })

  it('reclaims a finalized skipped cycle when a healthy retry arrives', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.catalogRefreshCycle.updateMany.mockImplementation(
      async (args: { where: { OR?: unknown } }) => ({
        count: args.where.OR == null ? 0 : 1
      })
    )
    prisma.pos.count.mockResolvedValueOnce(100).mockResolvedValueOnce(95)
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.catalogRefreshCycle.updateMany).toHaveBeenCalledWith({
      where: {
        cycleId: '2026-08-02',
        country: 'US',
        OR: [{ finalizedAt: null }, { reconciliationSkipped: true }]
      },
      data: { finalizedAt: OBSERVED_AT }
    })
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: false
    })
  })

  it('establishes the first non-empty catalog baseline without advancing missing stores', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshCycle.findFirst.mockReset().mockResolvedValue(null)
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.pos.count.mockResolvedValueOnce(10).mockResolvedValueOnce(10)
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: false,
      storesMarkedMissing: 0,
      storesClosed: 0
    })
  })

  it('rejects a sparse first baseline when it covers too few known stores', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshCycle.findFirst.mockReset().mockResolvedValue(null)
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.pos.count.mockResolvedValueOnce(100).mockResolvedValueOnce(10)
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(prisma.catalogRefreshCycle.update).toHaveBeenCalledWith({
      where: {
        cycleId_country: { cycleId: '2026-08-02', country: 'US' }
      },
      data: {
        reconciliationSkipped: true,
        knownStoreCount: 100,
        observedStoreCount: 10
      }
    })
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: true,
      storesMarkedMissing: 0,
      storesClosed: 0
    })
  })

  it('rejects an empty first baseline when known stores already exist', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshCycle.findFirst.mockReset().mockResolvedValue(null)
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.pos.count.mockResolvedValueOnce(100).mockResolvedValueOnce(0)
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [],
      observedAt: OBSERVED_AT
    })

    expect(prisma.pos.updateMany).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      cycleFinalized: true,
      reconciliationSkipped: true,
      storesClosed: 0
    })
  })

  it('does not reconcile the same country cycle twice', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshScope.count.mockResolvedValue(2)
    prisma.catalogRefreshCycle.updateMany.mockResolvedValue({ count: 0 })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [],
      observedAt: OBSERVED_AT
    })

    expect(prisma.pos.count).not.toHaveBeenCalled()
    expect(result.cycleFinalized).toBe(false)
  })

  it('ignores a stale scope refresh once a newer country cycle is finalized', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshCycle.findFirst.mockReset().mockResolvedValue({
      cycleId: '2026-08-09'
    })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.$executeRaw).not.toHaveBeenCalled()
    expect(prisma.catalogRefreshCycle.upsert).not.toHaveBeenCalled()
    expect(result.cycleFinalized).toBe(false)
  })

  it('rechecks for newer cycles after taking the country reconciliation lock', async () => {
    const prisma = createPrismaMock()
    prisma.catalogRefreshCycle.findFirst
      .mockReset()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ cycleId: '2026-08-09' })
    const repository = new PrismaCatalogLifecycleRepository(prisma as never)

    const result = await repository.recordScopeRefresh({
      cycleId: '2026-08-02',
      country: 'US',
      scope: 'US2',
      expectedScopes: ['US', 'US2'],
      complete: true,
      stores: [createStore()],
      observedAt: OBSERVED_AT
    })

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1)
    expect(prisma.$executeRaw).not.toHaveBeenCalled()
    expect(prisma.catalogRefreshCycle.upsert).not.toHaveBeenCalled()
    expect(result.cycleFinalized).toBe(false)
  })
})
