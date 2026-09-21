import type { DoraResourceKey } from '@/types'
import {
  DORA_RESOURCE_DEFINITIONS,
  DORA_RESOURCE_RANGES,
  DORA_STATUS_THRESHOLDS,
} from './doraConstants'

export type DoraThresholdLevel = 'warning' | 'critical'

export interface DoraResourceThresholdHit {
  resource: DoraResourceKey
  severity: DoraThresholdLevel
  threshold: number
  thresholdDescription: string
}

function formatThreshold(resource: DoraResourceKey, threshold: number): string {
  const { unit } = DORA_RESOURCE_DEFINITIONS[resource]
  if (unit === 'L') return `${threshold.toLocaleString('en-LK')} ${unit}`
  return `${threshold} ${unit}`
}

export function evaluateDoraFuelLevel(
  value: number,
): DoraResourceThresholdHit | null {
  const { warning, critical } = DORA_STATUS_THRESHOLDS.fuelLevel
  if (value <= critical) {
    return {
      resource: 'fuelLevel',
      severity: 'critical',
      threshold: critical,
      thresholdDescription: `At or below the critical threshold (${formatThreshold('fuelLevel', critical)})`,
    }
  }
  if (value <= warning) {
    return {
      resource: 'fuelLevel',
      severity: 'warning',
      threshold: warning,
      thresholdDescription: `At or below the warning threshold (${formatThreshold('fuelLevel', warning)})`,
    }
  }
  return null
}

export function evaluateDoraPowerConsumption(
  value: number,
): DoraResourceThresholdHit | null {
  const { warning, critical } = DORA_STATUS_THRESHOLDS.powerConsumption
  if (value >= critical) {
    return {
      resource: 'powerConsumption',
      severity: 'critical',
      threshold: critical,
      thresholdDescription: `At or above the critical threshold (${formatThreshold('powerConsumption', critical)})`,
    }
  }
  if (value >= warning) {
    return {
      resource: 'powerConsumption',
      severity: 'warning',
      threshold: warning,
      thresholdDescription: `At or above the warning threshold (${formatThreshold('powerConsumption', warning)})`,
    }
  }
  return null
}

export function evaluateDoraResourceThreshold(
  resource: DoraResourceKey,
  value: number,
): DoraResourceThresholdHit | null {
  const { min, max } = DORA_RESOURCE_RANGES[resource]
  const clamped = Math.min(max, Math.max(min, value))

  if (resource === 'fuelLevel') return evaluateDoraFuelLevel(clamped)
  return evaluateDoraPowerConsumption(clamped)
}
