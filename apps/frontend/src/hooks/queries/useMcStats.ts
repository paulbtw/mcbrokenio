import { type QueryFunction, useQuery } from 'react-query'
import axios from 'axios'

interface McStats {
  total: number
  trackable: number
  availablemilkshakes: number
  totalmilkshakes: number
  availablemcflurry: number
  totalmcflurry: number
  availablemcsundae: number
  totalmcsundae: number
  country: string
}

const fetchMcStats: QueryFunction<McStats[]> = async ({ signal }) => {
  const { data } = await axios.get<McStats[]>('/assets/stats.json', {
    signal
  })

  return data
}

export const useMcStats = () => {
  return useQuery({
    queryKey: 'mcStats',
    queryFn: fetchMcStats,
    refetchInterval: 5 * 60 * 1000
  })
}
