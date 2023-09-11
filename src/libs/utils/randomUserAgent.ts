import { UserAgent } from '@libs/constants/UserAgent'

export function randomUserAgent() {
  return UserAgent[Math.floor(Math.random() * UserAgent.length)]
}
