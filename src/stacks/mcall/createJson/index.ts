import { createJson } from '@libs/services/createJson'

export const handler = async () => {
  await createJson()

  return null
}
