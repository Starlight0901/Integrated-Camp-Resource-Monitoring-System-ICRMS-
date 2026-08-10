import type { Camp, MetricKey } from '@/types'
import { SectionHeader } from '@/components/ui'
import { CampMetricCard } from './CampMetricCard'
import { METRIC_CARD_ORDER } from '@/utils/metricConfig'

export interface CampMetricsPanelProps {
  camp: Camp
  onMetricClick: (metricKey: MetricKey) => void
  highlightedMetric?: MetricKey | null
}

export function CampMetricsPanel({
  camp,
  onMetricClick,
  highlightedMetric = null,
}: CampMetricsPanelProps) {
  return (
    <section aria-label="Live telemetry">
      <SectionHeader
        title="Live Telemetry"
        subtitle="Current readings — select a metric to inspect historical data"
        className="mb-4"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_CARD_ORDER.map((key) => (
          <CampMetricCard
            key={key}
            metric={camp.metrics[key]}
            onClick={() => onMetricClick(key)}
            highlighted={highlightedMetric === key}
          />
        ))}
      </div>
    </section>
  )
}
