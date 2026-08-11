import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

import {
  fetchPublishedAvailabilitySnapshot,
  publishedAvailabilitySnapshotQueryKey
} from './usePublishedAvailabilitySnapshot'

vi.mock('axios')

describe('Published Availability Snapshot query', () => {
  it('uses one stable query key for all snapshot readers', () => {
    expect(publishedAvailabilitySnapshotQueryKey).toEqual([
      'publishedAvailabilitySnapshot'
    ])
  })

  it('fetches the canonical snapshot representation', async () => {
    const snapshot = {
      schemaVersion: 1 as const,
      publishedAt: '2026-08-11T08:00:00.000Z',
      markers: { type: 'FeatureCollection' as const, features: [] },
      statistics: []
    }
    vi.mocked(axios.get).mockResolvedValue({ data: snapshot })
    const signal = new AbortController().signal

    await expect(fetchPublishedAvailabilitySnapshot(signal)).resolves.toBe(
      snapshot
    )
    expect(axios.get).toHaveBeenCalledWith('/snapshot.json', { signal })
  })
})
