import { Logger } from '@sailplane/logger'

import { type StorageClient } from '../../clients'
import { type PosRepository, type StatsRepository } from '../../repositories'

import { createGeoJson } from './generateGeoJson'

const logger = new Logger('JsonExportOrchestrator')

/**
 * Dependencies required by the JsonExportOrchestrator
 */
export interface JsonExportOrchestratorDeps {
  /** Repository for POS data access */
  posRepository: PosRepository
  /** Repository for stats data access */
  statsRepository: StatsRepository
  /** Storage client for uploading JSON files */
  storageClient: StorageClient
}

/**
 * Result of the JSON export operation
 */
export interface JsonExportResult {
  /** Number of stores exported */
  storesExported: number
  /** Number of countries in stats */
  countriesInStats: number
  /** Files uploaded */
  filesUploaded: string[]
}

/**
 * Orchestrates the process of generating and uploading JSON exports
 * This class handles the workflow but delegates actual work to injected dependencies
 */
export class JsonExportOrchestrator {
  private readonly posRepository: PosRepository
  private readonly statsRepository: StatsRepository
  private readonly storageClient: StorageClient

  constructor(deps: JsonExportOrchestratorDeps) {
    this.posRepository = deps.posRepository
    this.statsRepository = deps.statsRepository
    this.storageClient = deps.storageClient
  }

  /**
   * Generate and upload GeoJSON and stats files
   */
  async exportAll(): Promise<JsonExportResult> {
    logger.info('Starting JSON export')

    // Fetch all data
    const [allPos, stats] = await Promise.all([
      this.posRepository.findAll(),
      this.statsRepository.getAggregatedStats()
    ])

    logger.info(`Found ${allPos.length} stores and ${stats.length} stat entries`)

    // Generate GeoJSON (pure function)
    const geoJson = createGeoJson(allPos)

    // Upload both files
    await Promise.all([
      this.storageClient.uploadJson('marker.json', geoJson),
      this.storageClient.uploadJson('stats.json', stats)
    ])

    logger.info('JSON export completed successfully')

    return {
      storesExported: allPos.length,
      countriesInStats: stats.length,
      filesUploaded: ['marker.json', 'stats.json']
    }
  }
}

/**
 * Factory function to create a JsonExportOrchestrator
 */
export function createJsonExportOrchestrator(
  deps: JsonExportOrchestratorDeps
): JsonExportOrchestrator {
  return new JsonExportOrchestrator(deps)
}
