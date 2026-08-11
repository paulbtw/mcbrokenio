import { type Pos } from '@mcbroken/db'

/** The one persisted store projection shared across an Availability Poll. */
export type AvailabilityPollStore = Pick<
  Pos,
  'id' | 'nationalStoreNumber' | 'country' | 'errorCounter'
>
