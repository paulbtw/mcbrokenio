import { type QueryFunction, useQuery } from 'react-query'
import axios from 'axios'

const fetchLocation: QueryFunction<any> = async ({ signal }) => {
  const { data } = await axios.get<any>('/ip', {
    signal
  })

  return data
}

export const useLocation = () => {
  return useQuery({
    queryKey: 'location',
    queryFn: fetchLocation
  })
}
