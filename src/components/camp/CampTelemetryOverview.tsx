import type { Camp } from '@/types'
import { Card } from '@/components/ui'
import { formatMetricValue } from '@/utils'
import { METRIC_CARD_ORDER, METRIC_DISPLAY_CONFIG, metricRangePercent } from '@/utils/metricConfig'
import { getMetricTelemetryColor, useChartTheme } from '@/theme'

export interface CampTelemetryOverviewProps {
  camp: Camp
  onMetricClick: (key: (typeof METRIC_CARD_ORDER)[number]) => void
}

/** Compact at-a-glance summary — secondary to the main metric cards. */
export function CampTelemetryOverview({ camp, onMetricClick }: CampTelemetryOverviewProps) {
  const chartTheme = useChartTheme()

  return (
    <section aria-label="Telemetry summary">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cw-text-dim">
        Quick overview
      </p>
      <Card padding="none" variant="default">
        <div className="grid grid-cols-2 divide-x divide-y divide-cw-border-subtle sm:grid-cols-4 sm:divide-y-0">
          {METRIC_CARD_ORDER.map((key) => {
            const metric = camp.metrics[key]
            const config = METRIC_DISPLAY_CONFIG[key]
            const Icon = config.icon
            const rangePercent = metricRangePercent(key, metric.value)
            const seriesColor = getMetricTelemetryColor(key, chartTheme)

            return (
              <button
                key={key}
                type="button"
                onClick={() => onMetricClick(key)}
                className="flex flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-cw-surface-hover"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: seriesColor }}
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
                    {config.label}
                  </span>
                </div>
                <span className="cw-telemetry-value text-sm font-semibold text-cw-text">
                  {formatMetricValue(metric)} {config.unit}
                </span>
                <div className="h-1 overflow-hidden rounded-full bg-cw-bg-elevated">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${rangePercent}%`,
                      backgroundColor: seriesColor,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
