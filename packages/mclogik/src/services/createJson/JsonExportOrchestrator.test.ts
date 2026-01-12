import { type Pos } from '@mcbroken/db'
import { describe, expect, it, vi } from 'vitest'

import { InMemoryStorageClient, type StorageClient } from '../../clients'
import {
  type CountryStats,
  type PosRepository,
  type StatsRepository
} from '../../repositories'

import {
  createJsonExportOrchestrator,
  JsonExportOrchestrator
} from './JsonExportOrchestrator'

describe('JsonExportOrchestrator', () => {
  const createMockPosRepository = (): PosRepository => ({
    findByCountries: vi.fn(),
    findAll: vi.fn(),
    updateManyStatus: vi.fn(),
    upsertMany: vi.fn()
  })

  const createMockStatsRepository = (): StatsRepository => ({
    getAggregatedStats: vi.fn()
  })

  const createMockStorageClient = (): StorageClient => ({
    uploadJson: vi.fn()
  })

  const createMockPos = (overrides: Partial<Pos> = {}): Pos => ({
    id: 'store-123',
    nationalStoreNumber: '12345',
    name: 'Test Store',
    latitude: '40.7128',
    longitude: '-74.0060',
    country: 'US',
    hasMobileOrdering: true,
    mcFlurryCount: 2,
    mcFlurryError: 0,
    mcFlurryStatus: 'AVAILABLE',
    mcSundaeCount: 1,
    mcSundaeError: 0,
    mcSundaeStatus: 'AVAILABLE',
    milkshakeCount: 3,
    milkshakeError: 1,
    milkshakeStatus: 'PARTIAL_AVAILABLE',
    customItems: [],
    lastChecked: new Date('2024-01-01T12:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })

  const createMockStats = (country: string = 'US'): CountryStats => ({
    country,
    total: 100,
    trackable: 80,
    availableMilkshakes: 70,
    totalMilkshakes: 80,
    availableMcFlurry: 75,
    totalMcFlurry: 80,
    availableMcSundae: 78,
    totalMcSundae: 80
  })

  describe('exportAll', () => {
    it('should fetch data, generate GeoJSON, and upload files', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const mockStorageClient = createMockStorageClient()

      const stores = [
        createMockPos({ id: 'store-1', name: 'Store One' }),
        createMockPos({ id: 'store-2', name: 'Store Two' })
      ]
      const stats = [createMockStats('US'), createMockStats('CA')]

      vi.mocked(mockPosRepository.findAll).mockResolvedValue(stores)
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue(stats)
      vi.mocked(mockStorageClient.uploadJson).mockResolvedValue(undefined)

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: mockStorageClient
      })

      const result = await orchestrator.exportAll()

      expect(result).toEqual({
        storesExported: 2,
        countriesInStats: 2,
        filesUploaded: ['marker.json', 'stats.json']
      })

      expect(mockPosRepository.findAll).toHaveBeenCalled()
      expect(mockStatsRepository.getAggregatedStats).toHaveBeenCalled()
      expect(mockStorageClient.uploadJson).toHaveBeenCalledTimes(2)
      expect(mockStorageClient.uploadJson).toHaveBeenCalledWith(
        'marker.json',
        expect.objectContaining({
          type: 'FeatureCollection',
          features: expect.arrayContaining([
            expect.objectContaining({
              type: 'Feature',
              properties: expect.objectContaining({
                id: 'store-1',
                name: 'Store One'
              })
            })
          ])
        })
      )
      expect(mockStorageClient.uploadJson).toHaveBeenCalledWith(
        'stats.json',
        stats
      )
    })

    it('should handle empty stores', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const mockStorageClient = createMockStorageClient()

      vi.mocked(mockPosRepository.findAll).mockResolvedValue([])
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue([])
      vi.mocked(mockStorageClient.uploadJson).mockResolvedValue(undefined)

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: mockStorageClient
      })

      const result = await orchestrator.exportAll()

      expect(result).toEqual({
        storesExported: 0,
        countriesInStats: 0,
        filesUploaded: ['marker.json', 'stats.json']
      })

      expect(mockStorageClient.uploadJson).toHaveBeenCalledWith(
        'marker.json',
        expect.objectContaining({
          type: 'FeatureCollection',
          features: []
        })
      )
    })

    it('should work with InMemoryStorageClient', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const inMemoryStorage = new InMemoryStorageClient()

      const stores = [createMockPos({ id: 'store-1' })]
      const stats = [createMockStats('US')]

      vi.mocked(mockPosRepository.findAll).mockResolvedValue(stores)
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue(stats)

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: inMemoryStorage
      })

      await orchestrator.exportAll()

      expect(inMemoryStorage.keys()).toContain('marker.json')
      expect(inMemoryStorage.keys()).toContain('stats.json')

      const markerData = inMemoryStorage.get('marker.json') as {
        type: string
        features: unknown[]
      }
      expect(markerData.type).toBe('FeatureCollection')
      expect(markerData.features).toHaveLength(1)

      const statsData = inMemoryStorage.get('stats.json') as CountryStats[]
      expect(statsData).toHaveLength(1)
      expect(statsData[0].country).toBe('US')
    })

    it('should propagate storage errors', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const mockStorageClient = createMockStorageClient()

      vi.mocked(mockPosRepository.findAll).mockResolvedValue([])
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue([])
      vi.mocked(mockStorageClient.uploadJson).mockRejectedValue(
        new Error('Upload failed')
      )

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: mockStorageClient
      })

      await expect(orchestrator.exportAll()).rejects.toThrow('Upload failed')
    })

    it('should propagate repository errors', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const mockStorageClient = createMockStorageClient()

      vi.mocked(mockPosRepository.findAll).mockRejectedValue(
        new Error('Database error')
      )
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue([])

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: mockStorageClient
      })

      await expect(orchestrator.exportAll()).rejects.toThrow('Database error')
    })

    it('should generate correct GeoJSON structure', async () => {
      const mockPosRepository = createMockPosRepository()
      const mockStatsRepository = createMockStatsRepository()
      const inMemoryStorage = new InMemoryStorageClient()

      const store = createMockPos({
        id: 'store-1',
        name: 'Test Store',
        latitude: '40.7128',
        longitude: '-74.0060',
        milkshakeStatus: 'AVAILABLE',
        mcFlurryStatus: 'UNAVAILABLE',
        mcSundaeStatus: 'PARTIAL_AVAILABLE',
        hasMobileOrdering: true
      })

      vi.mocked(mockPosRepository.findAll).mockResolvedValue([store])
      vi.mocked(mockStatsRepository.getAggregatedStats).mockResolvedValue([])

      const orchestrator = new JsonExportOrchestrator({
        posRepository: mockPosRepository,
        statsRepository: mockStatsRepository,
        storageClient: inMemoryStorage
      })

      await orchestrator.exportAll()

      const markerData = inMemoryStorage.get('marker.json') as {
        type: string
        features: Array<{
          type: string
          geometry: { type: string; coordinates: number[] }
          properties: Record<string, unknown>
        }>
      }

      expect(markerData.features[0]).toMatchObject({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-74.006, 40.7128, 0]
        },
        properties: {
          id: 'store-1',
          name: 'Test Store',
          hasMilchshake: 'AVAILABLE',
          hasMcFlurry: 'UNAVAILABLE',
          hasMcSundae: 'PARTIAL_AVAILABLE',
          hasMobileOrdering: true
        }
      })
    })
  })

  describe('createJsonExportOrchestrator', () => {
    it('should create an orchestrator instance', () => {
      const orchestrator = createJsonExportOrchestrator({
        posRepository: createMockPosRepository(),
        statsRepository: createMockStatsRepository(),
        storageClient: createMockStorageClient()
      })

      expect(orchestrator).toBeInstanceOf(JsonExportOrchestrator)
    })
  })
})
