export function chunkArray<T>(array: T[], chunkSize: number) {
  const results = []
  while (array.length > 0) {
    results.push(array.splice(0, chunkSize))
  }
  return results
}
