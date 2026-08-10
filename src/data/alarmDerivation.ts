import type { Alarm, Camp, CampTelemetrySeries, MetricKey } from '@/types'
import { METRIC_DEFINITIONS } from '@/types'
import { evaluateMetricAlarm } from './alarmThresholds'

const METRIC_KEYS: MetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

function findThresholdCrossingTimestamp(
  series: CampTelemetrySeries | undefined,
  threshold: number,
  direction: 'above' | 'below',
): string | null {
  if (!series) return null

  for (let i = series.points.length - 1; i >= 1; i--) {
    const current = series.points[i]!
    const previous = series.points[i - 1]!

    const crossed =
      direction === 'below'
        ? previous.value > threshold && current.value <= threshold
        : previous.value < threshold && current.value >= threshold

    if (crossed) return current.timestamp
  }

  return null
}

function thresholdDirection(
  metric: MetricKey,
  description: string,
): 'above' | 'below' {
  if (description.includes('Above')) return 'above'
  if (description.includes('lower')) return 'below'
  if (metric === 'temperature') return 'above'
  if (metric === 'apparentPower' && description.includes('upper')) return 'above'
  return 'below'
}

export function deriveAlarmsFromCamps(
  camps: Camp[],
  telemetry: CampTelemetrySeries[] = [],
): Alarm[] {
  const alarms: Alarm[] = []
  let counter = 1

  for (const camp of camps) {
    for (const metricKey of METRIC_KEYS) {
      const metric = camp.metrics[metricKey]
      const evaluation = evaluateMetricAlarm(metricKey, metric.value)
      if (!evaluation) continue

      const series = telemetry.find(
        (entry) => entry.campId === camp.id && entry.metric === metricKey,
      )
      const direction = thresholdDirection(metricKey, evaluation.thresholdDescription)
      const crossingTimestamp = findThresholdCrossingTimestamp(
        series,
        evaluation.threshold,
        direction,
      )

      alarms.push({
        id: `alarm-${String(counter++).padStart(3, '0')}`,
        campId: camp.id,
        campName: camp.name,
        metric: metricKey,
        metricLabel: METRIC_DEFINITIONS[metricKey].label,
        severity: evaluation.severity,
        currentValue: metric.value,
        unit: metric.unit,
        threshold: evaluation.threshold,
        thresholdDescription: evaluation.thresholdDescription,
        timestamp: crossingTimestamp ?? camp.lastUpdated,
        status: 'active',
        acknowledged: false,
      })
    }
  }

  return alarms.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export function getActiveAlarms(alarms: Alarm[]): Alarm[] {
  return alarms.filter((alarm) => alarm.status === 'active')
}

export function getTopAlarmSeverity(
  alarms: Alarm[],
): 'warning' | 'critical' | null {
  const active = getActiveAlarms(alarms)
  if (active.some((a) => a.severity === 'critical')) return 'critical'
  if (active.some((a) => a.severity === 'warning')) return 'warning'
  return null
}

export function getCampAlarmSeverity(
  campId: string,
  alarms: Alarm[],
): 'warning' | 'critical' | null {
  const campAlarms = getActiveAlarms(alarms).filter((a) => a.campId === campId)
  if (campAlarms.some((a) => a.severity === 'critical')) return 'critical'
  if (campAlarms.some((a) => a.severity === 'warning')) return 'warning'
  return null
}
