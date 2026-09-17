import { useEffect, useMemo, useState } from 'react'
import { telemetryService } from '@/services'
import type { Camp, MetricKey } from '@/types'
import { METRIC_CARD_ORDER } from '@/utils/metricConfig'
import { evaluateCamp, observeMetricTrend } from '@/monitoring'

export type CampTrendMap = Partial<Record<MetricKey, string>>

export function useCampTrendObservations(camp: Camp | null | undefined): CampTrendMap {
  const evaluation = useMemo(
    () => (camp ? evaluateCamp(camp) : null),
    [camp],
  )
  const statusKey = evaluation
    ? evaluation.resources.map((resource) => `${resource.metric}:${resource.status}`).join('|')
    : ''

  const [trends, setTrends] = useState<CampTrendMap>({})

  useEffect(() => {
    if (!camp) {
      setTrends({})
      return
    }

    let cancelled = false
    const statuses = Object.fromEntries(
      (evaluation?.resources ?? []).map((resource) => [resource.metric, resource.status]),
    )

    Promise.all(
      METRIC_CARD_ORDER.map((metric) =>
        telemetryService.getHistoricalTelemetry(camp.id, metric, '24h'),
      ),
    )
      .then((series) => {
        if (cancelled) return
        const next: CampTrendMap = {}
        for (const entry of series) {
          const observation = observeMetricTrend(
            entry.metric,
            entry.points,
            statuses[entry.metric] ?? 'online',
          )
          if (observation) next[entry.metric] = observation
        }
        setTrends(next)
      })
      .catch(() => {
        if (!cancelled) setTrends({})
      })

    return () => {
      cancelled = true
    }
  }, [camp, evaluation, statusKey])

  return trends
}
