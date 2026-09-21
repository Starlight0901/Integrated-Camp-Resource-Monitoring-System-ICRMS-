import { useSyncExternalStore } from 'react'
import { getLiveDoras, subscribeDoraLive } from '@/data/doraLiveSimulator'

export function useDoras() {
  return useSyncExternalStore(subscribeDoraLive, getLiveDoras, getLiveDoras)
}
