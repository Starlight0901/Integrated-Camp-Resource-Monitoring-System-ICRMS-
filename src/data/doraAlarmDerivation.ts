import type { Dora, DoraAlarm, DoraResourceKey, TelemetryPoint } from '@/types'
import { evaluateDora } from '@/monitoring/doraEvaluation'
import { getDoraHistoricalSeries } from './doraHistoricalTelemetry'
import { getCurrentDate } from '@/utils/dates'

function findThresholdCrossingTimestamp(
  points: TelemetryPoint[] | undefined,
  threshold: number,
  direction: 'above' | 'below',
): string | null {
  if (!points || points.length < 2) return null

  for (let i = points.length - 1; i >= 1; i--) {
    const current = points[i]!
    const previous = points[i - 1]!
    const crossed =
      direction === 'below'
        ? previous.value > threshold && current.value <= threshold
        : previous.value < threshold && current.value >= threshold
    if (crossed) return current.timestamp
  }

  return null
}

function crossingDirection(resource: DoraResourceKey): 'above' | 'below' {
  return resource === 'powerConsumption' ? 'above' : 'below'
}

function latestPointTimestamp(points: TelemetryPoint[] | undefined): string | null {
  if (!points || points.length === 0) return null
  return points[points.length - 1]!.timestamp
}

/** One active alarm per DORA resource currently in warning or critical. */
export function deriveAlarmsFromDoras(doras: Dora[]): DoraAlarm[] {
  const alarms: DoraAlarm[] = []

  for (const dora of doras) {
    const evaluation = evaluateDora(dora)

    for (const resource of evaluation.attentionResources) {
      if (resource.status === 'normal' || resource.threshold == null) continue

      const series = getDoraHistoricalSeries(dora.id, resource.resource)
      const direction = crossingDirection(resource.resource)
      const timestamp =
        findThresholdCrossingTimestamp(
          series?.points,
          resource.threshold,
          direction,
        ) ??
        latestPointTimestamp(series?.points) ??
        getCurrentDate().toISOString()

      alarms.push({
        source: 'dora',
        id: `dora-alarm-${dora.id}-${resource.resource}`,
        doraId: dora.id,
        doraName: dora.name,
        resource: resource.resource,
        resourceLabel: resource.label,
        severity: resource.status,
        currentValue: resource.value,
        unit: resource.unit,
        threshold: resource.threshold,
        thresholdDescription: resource.thresholdDescription ?? '',
        reason: resource.reason,
        timestamp,
        status: 'active',
        acknowledged: false,
      })
    }
  }

  return alarms.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}
