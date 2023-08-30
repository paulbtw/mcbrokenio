import { UserAgent } from '../constants/UserAgent';

export function randomUserAgent() {
  return UserAgent[Math.floor(Math.random() * UserAgent.length)];
}
