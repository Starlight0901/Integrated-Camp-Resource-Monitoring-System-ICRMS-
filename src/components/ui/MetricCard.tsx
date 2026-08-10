import type { CampStatus, Metric } from '@/types'
import { cn, formatMetricValue, getCampStatusStyle, METRIC_ICONS } from '@/utils'
import { Card } from './Card'

export interface MetricCardProps {
  metric: Metric
  status?: CampStatus
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function MetricCard({
  metric,
  status,
  loading = false,
  className,
  onClick,
}: MetricCardProps) {
  const Icon = METRIC_ICONS[metric.key]
  const statusStyle = status ? getCampStatusStyle(status) : null

  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      padding="md"
      className={cn(
        'group relative overflow-hidden',
        statusStyle && statusStyle.border,
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {statusStyle && status !== 'offline' && status !== 'online' && (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-px',
            status === 'warning' && 'bg-cw-status-warning/50',
            status === 'critical' && 'bg-cw-status-critical/50',
          )}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-cw-text-muted">
            {metric.label}
          </p>

          {loading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded-cw-sm bg-cw-surface-hover" />
          ) : (
            <p className="cw-telemetry-value mt-1.5 text-3xl font-semibold leading-none text-cw-text">
              {formatMetricValue(metric)}
              <span className="ml-1.5 text-base font-normal text-cw-text-muted">
                {metric.unit}
              </span>
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated transition-colors duration-200',
            'group-hover:border-cw-border group-hover:bg-cw-surface-hover',
            statusStyle && statusStyle.text,
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  )
}
