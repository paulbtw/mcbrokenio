import { type MarketCode } from '../../types'

/** The domain store projection shared across one Availability Poll. */
export interface AvailabilityPollStore {
  id: string
  nationalStoreNumber: string
  market: MarketCode
  errorCounter: number
}
