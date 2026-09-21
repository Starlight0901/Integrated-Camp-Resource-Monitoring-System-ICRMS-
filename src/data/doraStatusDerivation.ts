import type { DoraReadings, DoraStatus } from '@/types'
import { DORA_RESOURCE_ORDER, DORA_RESOURCE_RANGES } from './doraConstants'
import { evaluateDoraResourceThreshold } from './doraThresholds'

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampDoraReadings(readings: DoraReadings): DoraReadings {
  return {
    fuelLevel: clampToRange(
      readings.fuelLevel,
      DORA_RESOURCE_RANGES.fuelLevel.min,
      DORA_RESOURCE_RANGES.fuelLevel.max,
    ),
    powerConsumption: clampToRange(
      readings.powerConsumption,
      DORA_RESOURCE_RANGES.powerConsumption.min,
      DORA_RESOURCE_RANGES.powerConsumption.max,
    ),
  }
}

const STATUS_RANK: Record<DoraStatus, number> = {
  normal: 0,
  warning: 1,
  critical: 2,
}

export function doraStatusRank(status: DoraStatus): number {
  return STATUS_RANK[status]
}

export function worseDoraStatus(left: DoraStatus, right: DoraStatus): DoraStatus {
  return STATUS_RANK[left] >= STATUS_RANK[right] ? left : right
}

/** Derive DORA operational status from current fuel and power readings. */
export function deriveDoraStatus(readings: DoraReadings): DoraStatus {
  const clamped = clampDoraReadings(readings)
  return DORA_RESOURCE_ORDER.reduce<DoraStatus>((status, resource) => {
    const hit = evaluateDoraResourceThreshold(resource, clamped[resource])
    return hit ? worseDoraStatus(status, hit.severity) : status
  }, 'normal')
}
