import type { DoraLocation } from '@/types'

export function formatDoraCoordinates(location: DoraLocation): string {
  return `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E`
}
