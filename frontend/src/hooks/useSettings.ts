import { useLocalStorage } from 'usehooks-ts'

interface Settings {
  debugMode: boolean
}

export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    debugMode: false
  })

  return [settings, setSettings] as const
}
