import { type Handler, type APIGatewayEvent } from 'aws-lambda'
import axios from 'axios'

export interface IIPService {
  query: string
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
}

export const handler: Handler<APIGatewayEvent> = async (event) => {
  let ip = event.headers['X-Forwarded-For']
  if (ip == null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No IP address found'
      })
    }
  }

  const splittedIp = ip.split(',');
  [ip] = splittedIp

  const location = await axios.get<IIPService>(`http://ip-api.com/json/${ip}`)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      success: true,
      lat: location.data.lat,
      lon: location.data.lon
    })
  }
}
