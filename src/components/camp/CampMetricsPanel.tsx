import type { Camp, MetricKey } from '@/types'
import { SectionHeader } from '@/components/ui'
import { CampMetricCard } from './CampMetricCard'
import { METRIC_CARD_ORDER } from '@/utils/metricConfig'
import { evaluateCamp, evaluateMetric, getResourceEvaluation } from '@/monitoring'
import type { CampTrendMap } from '@/hooks'

export interface CampMetricsPanelProps {
  camp: Camp
  onMetricClick: (metricKey: MetricKey) => void
  highlightedMetric?: MetricKey | null
  trends?: CampTrendMap
}

const SECONDARY_METRICS = METRIC_CARD_ORDER.filter((key) => key !== 'apparentPower')

export function CampMetricsPanel({
  camp,
  onMetricClick,
  highlightedMetric = null,
  trends = {},
}: CampMetricsPanelProps) {
  const evaluation = evaluateCamp(camp)

  return (
    <section aria-label="Live telemetry">
      <SectionHeader
        title="Live Telemetry"
        subtitle="Current readings — select a metric to inspect historical data"
        className="mb-4"
      />
      <div className="space-y-4">
        <CampMetricCard
          metric={camp.metrics.apparentPower}
          evaluation={
            getResourceEvaluation(evaluation, 'apparentPower') ??
            evaluateMetric(camp.metrics.apparentPower)
          }
          onClick={() => onMetricClick('apparentPower')}
          highlighted={highlightedMetric === 'apparentPower'}
          energyConsumption={camp.energyConsumption}
          trendObservation={trends.apparentPower}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SECONDARY_METRICS.map((key) => (
            <CampMetricCard
              key={key}
              metric={camp.metrics[key]}
              evaluation={
                getResourceEvaluation(evaluation, key) ?? evaluateMetric(camp.metrics[key])
              }
              onClick={() => onMetricClick(key)}
              highlighted={highlightedMetric === key}
              trendObservation={trends[key]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
