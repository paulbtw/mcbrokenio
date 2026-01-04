export interface RequestLimiter {
  maxRequestsPerSecond: number
  requestsPerLog: number
  concurrentRequests: number
}

export const defaultRequestLimiterAu = {
  maxRequestsPerSecond: 6,
  requestsPerLog: 500,
  concurrentRequests: 8
}

export const defaultRequestLimiterUs = {
  maxRequestsPerSecond: 6,
  requestsPerLog: 500,
  concurrentRequests: 8
}

export const defaultRequestLimiterEu = {
  maxRequestsPerSecond: 6,
  requestsPerLog: 100,
  concurrentRequests: 8
}
