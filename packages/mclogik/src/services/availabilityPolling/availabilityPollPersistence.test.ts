import { type PrismaClient } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { asMarketCode, type MarketCode, type UpdatePos } from '../../types'

import {
  type AvailabilityPollPersistence,
  PrismaAvailabilityPollPersistence
} from './availabilityPollPersistence'
import { type AvailabilityPollStore } from './availabilityPollTypes'

const FIXED_DATE = new Date('2026-08-11T08:00:00.000Z')
const TRANSACTION_TIMEOUT_MS = 30_000

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() =>
    Value extends Right ? 1 : 2
    ? true
    : false
type Expect<Value extends true> = Value
type EligibleMarketInput = Parameters<
  AvailabilityPollPersistence['loadEligibleStores']
>[0]
type _EligibleMarketInputIsBranded = Expect<
  Equal<EligibleMarketInput, MarketCode[]>
>

const STORE_PROJECTION: AvailabilityPollStore = {
  id: 'US-1',
  nationalStoreNumber: '1',
  country: 'US',
  errorCounter: 0
}

function createPrisma() {
  const findMany = vi.fn()
  const update = vi.fn().mockImplementation((input) => input)
  const transaction = vi.fn().mockResolvedValue([])
  const client = {
    pos: { findMany, update },
    $transaction: transaction
  } as unknown as PrismaClient

  return { client, findMany, transaction, update }
}

function createUpdate(id: string): UpdatePos {
  return {
    id,
    errorCounter: 0,
    isResponsive: true
  }
}

describe('PrismaAvailabilityPollPersistence', () => {
  it('loads only eligible active stores in oldest-first polling order', async () => {
    const { client, findMany } = createPrisma()
    const persistence = new PrismaAvailabilityPollPersistence(client)

    findMany.mockResolvedValue([STORE_PROJECTION])

    await expect(
      persistence.loadEligibleStores([
        asMarketCode('US'),
        asMarketCode('CA')
      ])
    ).resolves.toEqual([STORE_PROJECTION])
    expect(findMany).toHaveBeenCalledWith({
      where: {
        country: { in: ['US', 'CA'] },
        hasMobileOrdering: true,
        closedAt: null
      },
      take: 2000,
      orderBy: { updatedAt: 'asc' },
      select: {
        id: true,
        nationalStoreNumber: true,
        country: true,
        errorCounter: true
      }
    })
  })

  it('saves updates in bounded atomic batches with one poll timestamp', async () => {
    const { client, transaction, update } = createPrisma()
    const persistence = new PrismaAvailabilityPollPersistence(
      client,
      () => FIXED_DATE
    )
    const updates = Array.from({ length: 101 }, (_, index) =>
      createUpdate(`US-${index}`)
    )

    await persistence.saveUpdates(updates)

    expect(transaction).toHaveBeenCalledTimes(2)
    expect(
      transaction.mock.calls.map(([operations]) => operations.length)
    ).toEqual([100, 1])
    expect(transaction).toHaveBeenNthCalledWith(1, expect.any(Array), {
      timeout: TRANSACTION_TIMEOUT_MS
    })
    expect(transaction).toHaveBeenNthCalledWith(2, expect.any(Array), {
      timeout: TRANSACTION_TIMEOUT_MS
    })
    expect(update).toHaveBeenCalledTimes(101)
    expect(update).toHaveBeenCalledWith({
      where: { id: 'US-0' },
      data: expect.objectContaining({
        errorCounter: 0,
        isResponsive: true,
        lastChecked: FIXED_DATE,
        updatedAt: FIXED_DATE
      })
    })
  })

  it('validates every update before opening the first transaction', async () => {
    const { client, transaction, update } = createPrisma()
    const persistence = new PrismaAvailabilityPollPersistence(client)
    const updates = [
      createUpdate('US-1'),
      createUpdate(undefined as unknown as string)
    ]

    await expect(persistence.saveUpdates(updates)).rejects.toThrow(
      'Availability update is missing a store id'
    )
    expect(transaction).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('keeps earlier committed batches and stops after a later batch fails', async () => {
    const { client, transaction } = createPrisma()
    transaction
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('database unavailable'))
    const persistence = new PrismaAvailabilityPollPersistence(client)
    const updates = Array.from({ length: 201 }, (_, index) =>
      createUpdate(`US-${index}`)
    )

    await expect(persistence.saveUpdates(updates)).rejects.toThrow(
      'database unavailable'
    )
    expect(transaction).toHaveBeenCalledTimes(2)
    expect(transaction.mock.calls[0]?.[0]).toHaveLength(100)
    expect(transaction.mock.calls[1]?.[0]).toHaveLength(100)
  })

  it('replays the same update idempotently on retry', async () => {
    const { client, transaction, update } = createPrisma()
    const persistence = new PrismaAvailabilityPollPersistence(
      client,
      () => FIXED_DATE
    )
    const updates = [createUpdate('US-1')]

    await persistence.saveUpdates(updates)
    await persistence.saveUpdates(updates)

    expect(transaction).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: 'US-1' },
      data: expect.objectContaining({ updatedAt: FIXED_DATE })
    })
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: 'US-1' },
      data: expect.objectContaining({ updatedAt: FIXED_DATE })
    })
  })

  it('does not open a transaction for an empty update set', async () => {
    const { client, transaction } = createPrisma()
    const persistence = new PrismaAvailabilityPollPersistence(client)

    await persistence.saveUpdates([])

    expect(transaction).not.toHaveBeenCalled()
  })
})
