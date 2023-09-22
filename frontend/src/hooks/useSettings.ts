import { useLocalStorage } from 'usehooks-ts'

interface Settings {
  debugMode: boolean
}

export const useSettings = () => {
  return useLocalStorage<Settings>('settings', {
    debugMode: false
  })
}
