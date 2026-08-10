import type { MetricKey } from '@/types'
import { METRIC_RANGES } from './constants'

export type AlarmSeverityLevel = 'warning' | 'critical'

export interface DerivedAlarmEvaluation {
  severity: AlarmSeverityLevel
  threshold: number
  thresholdDescription: string
}

/** Percentage of tank capacity (relative to configured max). */
function capacityPercent(value: number, max: number): number {
  return (value / max) * 100
}

function powerRangePosition(value: number): number {
  const { min, max } = METRIC_RANGES.apparentPower
  return (value - min) / (max - min)
}

export function evaluateFuelLevel(value: number): DerivedAlarmEvaluation | null {
  const pct = capacityPercent(value, METRIC_RANGES.fuelLevel.max)
  if (pct < 15) {
    return {
      severity: 'critical',
      threshold: METRIC_RANGES.fuelLevel.max * 0.15,
      thresholdDescription: 'Below critical threshold (15% capacity)',
    }
  }
  if (pct < 30) {
    return {
      severity: 'warning',
      threshold: METRIC_RANGES.fuelLevel.max * 0.3,
      thresholdDescription: 'Below warning threshold (30% capacity)',
    }
  }
  return null
}

export function evaluateWaterLevel(value: number): DerivedAlarmEvaluation | null {
  const pct = capacityPercent(value, METRIC_RANGES.waterLevel.max)
  if (pct < 15) {
    return {
      severity: 'critical',
      threshold: METRIC_RANGES.waterLevel.max * 0.15,
      thresholdDescription: 'Below critical threshold (15% capacity)',
    }
  }
  if (pct < 30) {
    return {
      severity: 'warning',
      threshold: METRIC_RANGES.waterLevel.max * 0.3,
      thresholdDescription: 'Below warning threshold (30% capacity)',
    }
  }
  return null
}

export function evaluateTemperature(value: number): DerivedAlarmEvaluation | null {
  if (value > 26) {
    return {
      severity: 'critical',
      threshold: 26,
      thresholdDescription: 'Above critical threshold (26°C)',
    }
  }
  if (value > 25.5) {
    return {
      severity: 'warning',
      threshold: 25.5,
      thresholdDescription: 'Above warning threshold (25.5°C)',
    }
  }
  return null
}

export function evaluateApparentPower(value: number): DerivedAlarmEvaluation | null {
  const { min, max } = METRIC_RANGES.apparentPower
  const range = max - min
  const lowerCritical = min + range * 0.05
  const lowerWarning = min + range * 0.12
  const upperWarning = max - range * 0.12
  const upperCritical = max - range * 0.05

  if (value <= lowerCritical) {
    return {
      severity: 'critical',
      threshold: lowerCritical,
      thresholdDescription: 'Approaching lower critical limit',
    }
  }
  if (value >= upperCritical) {
    return {
      severity: 'critical',
      threshold: upperCritical,
      thresholdDescription: 'Approaching upper critical limit',
    }
  }
  if (value <= lowerWarning) {
    return {
      severity: 'warning',
      threshold: lowerWarning,
      thresholdDescription: 'Approaching lower warning limit',
    }
  }
  if (value >= upperWarning) {
    return {
      severity: 'warning',
      threshold: upperWarning,
      thresholdDescription: 'Approaching upper warning limit',
    }
  }

  return null
}

const METRIC_EVALUATORS: Record<
  MetricKey,
  (value: number) => DerivedAlarmEvaluation | null
> = {
  fuelLevel: evaluateFuelLevel,
  waterLevel: evaluateWaterLevel,
  temperature: evaluateTemperature,
  apparentPower: evaluateApparentPower,
}

export function evaluateMetricAlarm(
  metric: MetricKey,
  value: number,
): DerivedAlarmEvaluation | null {
  return METRIC_EVALUATORS[metric](value)
}

export function evaluateMetricStatus(
  metric: MetricKey,
  value: number,
): AlarmSeverityLevel | 'online' {
  const result = evaluateMetricAlarm(metric, value)
  return result?.severity ?? 'online'
}

export { powerRangePosition, capacityPercent }
