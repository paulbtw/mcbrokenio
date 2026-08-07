export {
  API_CLIENT_CONFIGS,
  type ApiClientConfig,
  createAllApiClients,
  createApiClient,
  ElApiClient,
  type McdonaldsApiClient,
  type McdonaldsRequestHeaders,
  type OutageResponse,
  StandardApiClient
} from './McdonaldsApiClient'
export {
  calculateStoreProductAvailability,
  checkProductAvailability,
  createStoreProductAvailabilityFetcher,
  type ProductAvailability,
  type StoreProductAvailability,
  StoreProductAvailabilityFetcher
} from './ProductAvailability'
export {
  createS3StorageClient,
  InMemoryStorageClient,
  S3StorageClient,
  type S3StorageClientConfig,
  type StorageClient
} from './StorageClient'
