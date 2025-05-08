import axios from 'axios'
import { type QueryFunction,useQuery } from 'react-query'

export interface LocationResponse {
  lat?: number
  lon?: number
}

const fetchLocation: QueryFunction<LocationResponse> = async ({ signal }) => {
  const { data } = await axios.get<LocationResponse>('/ip', { signal })

  return {
    lat: data.lat,
    lon: data.lon
  }
}

export const useLocation = () => {
  return useQuery({
    queryKey: 'location',
    queryFn: fetchLocation
  })
}
