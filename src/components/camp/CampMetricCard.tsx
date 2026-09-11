import type { CampStatus, EnergyConsumption, Metric, MetricKey } from '@/types'
import { LineChart } from 'lucide-react'
import { Card, StatusBadge } from '@/components/ui'
import {
  cn,
  formatMetricValue,
  formatMetricDisplay,
  CAMP_STATUS_LABELS,
} from '@/utils'
import {
  METRIC_DISPLAY_CONFIG,
  METRIC_ACCENT_CLASS,
  metricCapacityPercent,
  metricRangePercent,
} from '@/utils/metricConfig'
import { metricStatusForCamp } from '@/utils/metricStatus'
import { EnergyConsumptionSummary } from './EnergyConsumptionSummary'

export interface CampMetricCardProps {
  metric: Metric
  onClick: () => void
  highlighted?: boolean
  /** When set on Apparent Power, shows period energy totals (kWh) below the load reading. */
  energyConsumption?: EnergyConsumption
}

function resolveMetricStatus(key: MetricKey, value: number): CampStatus {
  const status = metricStatusForCamp(key, value)
  return status === 'online' ? 'online' : status
}

export function CampMetricCard({
  metric,
  onClick,
  highlighted = false,
  energyConsumption,
}: CampMetricCardProps) {
  const config = METRIC_DISPLAY_CONFIG[metric.key]
  const accent = METRIC_ACCENT_CLASS[metric.key]
  const Icon = config.icon
  const status = resolveMetricStatus(metric.key, metric.value)
  const rangePercent = metricRangePercent(metric.key, metric.value)
  const capacityPercent = metricCapacityPercent(metric.key, metric.value)
  const needsAttention = status === 'warning' || status === 'critical'
  const showEnergy =
    metric.key === 'apparentPower' && energyConsumption != null

  return (
    <Card
      variant="interactive"
      padding="none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${config.label}: ${formatMetricDisplay(metric)}. View 7-day trend.`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg',
        highlighted && 'ring-2 ring-cw-accent/25 ring-offset-2 ring-offset-cw-bg',
        needsAttention && status === 'critical' && 'border-cw-status-critical/30',
        needsAttention && status === 'warning' && 'border-cw-status-warning/30',
      )}
    >
      <div
        className={cn(
          'flex flex-1 flex-col gap-4 p-5',
          showEnergy && 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-stretch lg:gap-0',
        )}
      >
        <div
          className={cn(
            'flex flex-1 flex-col gap-4',
            showEnergy && 'lg:border-r lg:border-cw-border-subtle lg:pr-6',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-cw-md',
                  accent.wrap,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cw-text-muted">
                  {config.label}
                </p>
                <StatusBadge
                  status={status}
                  size="sm"
                  label={CAMP_STATUS_LABELS[status]}
                  pulse={status === 'critical'}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="cw-telemetry-value text-4xl font-semibold leading-none tracking-tight text-cw-text">
              {formatMetricValue(metric)}
              <span className="ml-2 text-lg font-normal text-cw-text-dim">
                {config.unit}
              </span>
            </p>
            {config.showCapacity && (
              <p className="mt-2 text-sm text-cw-text-dim">
                {capacityPercent}% tank capacity
              </p>
            )}
            {showEnergy && (
              <p className="mt-2 text-sm text-cw-text-dim">
                Current electrical load
              </p>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <div className="h-1 overflow-hidden rounded-full bg-cw-border-subtle">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  !needsAttention && accent.bar,
                  status === 'warning' && 'bg-cw-status-warning',
                  status === 'critical' && 'bg-cw-status-critical',
                )}
                style={{ width: `${rangePercent}%` }}
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-cw-text-dim transition-colors group-hover:text-cw-text-muted">
              <LineChart className="h-3.5 w-3.5" strokeWidth={1.75} />
              View 7-day trend
            </p>
          </div>
        </div>

        {showEnergy && (
          <div className="lg:pl-6">
            <EnergyConsumptionSummary energy={energyConsumption} />
          </div>
        )}
      </div>
    </Card>
  )
}
