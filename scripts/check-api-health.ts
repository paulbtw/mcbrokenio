#!/usr/bin/env ts-node
/**
 * API Health Check Script
 *
 * Tests all McDonald's country APIs to verify they're responding.
 * Groups results by VPN requirement for easier testing.
 *
 * Usage:
 *   pnpm ts-node scripts/check-api-health.ts [region]
 *
 * Regions:
 *   us       - Test US region APIs (requires US VPN)
 *   europe   - Test Europe region APIs (requires Europe VPN)
 *   australia - Test Australia region APIs (requires Australia VPN)
 *   all      - Test all regions (default)
 */

import 'dotenv/config'
import axios from 'axios'

import {
  APIType,
  ApLocations,
  ElLocations,
  EuLocations,
  type Locations,
  UsLocations
} from '../packages/mclogik/src/types'
import { CountryInfos } from '../packages/mclogik/src/constants/CountryInfos'
import { getBearerToken } from '../packages/mclogik/src/services/token/getBearerToken'

// VPN region groupings
const VPN_REGIONS = {
  us: {
    name: 'US (requires US VPN)',
    locations: Object.values(UsLocations) as Locations[]
  },
  europe: {
    name: 'Europe (requires Europe VPN)',
    locations: [
      ...Object.values(EuLocations),
      ...Object.values(ElLocations)
    ] as Locations[]
  },
  australia: {
    name: 'Australia (requires Australia VPN)',
    locations: Object.values(ApLocations) as Locations[]
  }
} as const

type VpnRegion = keyof typeof VPN_REGIONS

interface CheckResult {
  country: Locations
  apiType: APIType
  success: boolean
  error?: string
  responseTime?: number
}

/**
 * Test if a country's store listing API is responding
 */
async function checkCountryApi(
  country: Locations,
  token: string | undefined,
  clientId: string
): Promise<CheckResult> {
  const countryInfo = CountryInfos[country]

  if (!countryInfo || countryInfo.getStores.api === APIType.UNKNOWN) {
    return {
      country,
      apiType: APIType.UNKNOWN,
      success: false,
      error: 'No API configured'
    }
  }

  const { api, url } = countryInfo.getStores

  if (!url) {
    return {
      country,
      apiType: api,
      success: false,
      error: 'No URL configured'
    }
  }

  const startTime = Date.now()

  try {
    // For EL API, use a different endpoint structure
    if (api === APIType.EL) {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      })

      const responseTime = Date.now() - startTime

      if (response.status === 200) {
        return { country, apiType: api, success: true, responseTime }
      } else {
        return {
          country,
          apiType: api,
          success: false,
          error: `HTTP ${response.status}`,
          responseTime
        }
      }
    }

    // For EU/US/AP APIs, need authentication
    if (!token) {
      return {
        country,
        apiType: api,
        success: false,
        error: 'No auth token available'
      }
    }

    // Test with a simple location query
    const testUrl = `${url}latitude=0&longitude=0`

    const response = await axios.get(testUrl, {
      timeout: 10000,
      headers: {
        authorization: `Bearer ${token}`,
        'mcd-clientId': clientId,
        'mcd-sourceapp': 'GMA',
        'mcd-marketid': country,
        'mcd-uuid': '"'
      },
      validateStatus: (status) => status < 500
    })

    const responseTime = Date.now() - startTime

    if (response.status === 200) {
      return { country, apiType: api, success: true, responseTime }
    } else if (response.status === 401) {
      return {
        country,
        apiType: api,
        success: false,
        error: 'Auth failed (401)',
        responseTime
      }
    } else if (response.status === 403) {
      return {
        country,
        apiType: api,
        success: false,
        error: 'Forbidden - VPN required? (403)',
        responseTime
      }
    } else {
      return {
        country,
        apiType: api,
        success: false,
        error: `HTTP ${response.status}`,
        responseTime
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return {
          country,
          apiType: api,
          success: false,
          error: 'Timeout',
          responseTime
        }
      }
      if (error.code === 'ECONNREFUSED') {
        return {
          country,
          apiType: api,
          success: false,
          error: 'Connection refused',
          responseTime
        }
      }
      return {
        country,
        apiType: api,
        success: false,
        error: error.message,
        responseTime
      }
    }

    return {
      country,
      apiType: api,
      success: false,
      error: String(error),
      responseTime
    }
  }
}

/**
 * Get bearer tokens for all API types
 */
async function getTokens(): Promise<Map<APIType, string | undefined>> {
  const tokens = new Map<APIType, string | undefined>()

  for (const apiType of [APIType.EU, APIType.US, APIType.AP, APIType.EL]) {
    try {
      const token = await getBearerToken(apiType)
      tokens.set(apiType, token)
      console.log(`  ${apiType}: Token obtained`)
    } catch (error) {
      console.log(`  ${apiType}: Failed to get token`)
      tokens.set(apiType, undefined)
    }
  }

  return tokens
}

/**
 * Get client ID from environment variables for the given API type
 */
function getClientIdFromEnv(apiType: APIType): string {
  // Default client IDs per region
  const clientIds: Record<string, string> = {
    EU: process.env.CLIENT_ID_EU ?? 'unknown',
    US: process.env.CLIENT_ID_US ?? 'unknown',
    AP: process.env.CLIENT_ID_AP ?? 'unknown',
    EL: process.env.CLIENT_ID_EL ?? 'unknown'
  }
  return clientIds[apiType] ?? 'unknown'
}

/**
 * Print results for a region
 */
function printResults(regionName: string, results: CheckResult[]) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${regionName}`)
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  // Print successful first
  if (successful.length > 0) {
    console.log('\n  Working APIs:')
    for (const result of successful) {
      const time = result.responseTime ? ` (${result.responseTime}ms)` : ''
      console.log(`    ${result.country} [${result.apiType}]${time}`)
    }
  }

  // Print failed
  if (failed.length > 0) {
    console.log('\n  Failed APIs:')
    for (const result of failed) {
      const time = result.responseTime ? ` (${result.responseTime}ms)` : ''
      console.log(
        `    ${result.country} [${result.apiType}]: ${result.error}${time}`
      )
    }
  }

  // Summary
  console.log(`\n  Summary: ${successful.length}/${results.length} working`)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const regionArg = (args[0]?.toLowerCase() ?? 'all') as VpnRegion | 'all'

  console.log('McDonald\'s API Health Check')
  console.log('============================\n')

  // Validate region argument before doing any work
  if (!['all', 'us', 'europe', 'australia'].includes(regionArg)) {
    console.error(`Unknown region: ${regionArg}`)
    console.error('Valid regions: us, europe, australia, all')
    process.exit(1)
  }

  // Determine which regions to test
  const regionsToTest: VpnRegion[] =
    regionArg === 'all'
      ? ['us', 'europe', 'australia']
      : [regionArg as VpnRegion]

  console.log('Getting authentication tokens...')
  const tokens = await getTokens()

  for (const region of regionsToTest) {
    const regionConfig = VPN_REGIONS[region]
    const results: CheckResult[] = []

    console.log(`\nTesting ${regionConfig.name}...`)

    for (const location of regionConfig.locations) {
      const countryInfo = CountryInfos[location]
      const apiType = countryInfo?.getStores.api ?? APIType.UNKNOWN
      const token = tokens.get(apiType)
      const clientId = getClientIdFromEnv(apiType)

      const result = await checkCountryApi(location, token, clientId)
      results.push(result)

      // Progress indicator
      const status = result.success ? '\u2713' : '\u2717'
      process.stdout.write(status)
    }

    printResults(regionConfig.name, results)
  }

  console.log('\n\nDone!')
}

main().catch(console.error)
