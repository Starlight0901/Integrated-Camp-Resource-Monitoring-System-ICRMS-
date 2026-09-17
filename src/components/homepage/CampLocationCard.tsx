import { Link } from 'react-router-dom'
import { ChevronRight, Clock } from 'lucide-react'
import type { Camp, MetricKey } from '@/types'
import { Card, StatusBadge } from '@/components/ui'
import {
  CAMP_STATUS_LABELS,
  cn,
  formatDataFreshness,
  formatMetricDisplay,
  METRIC_CARD_ORDER,
  METRIC_SHORT_LABELS,
  shortCampLabel,
} from '@/utils'
import { evaluateCamp, shortCardCondition } from '@/monitoring'

export interface CampLocationCardProps {
  camp: Camp
}

export function CampLocationCard({ camp }: CampLocationCardProps) {
  const evaluation = evaluateCamp(camp)
  const isOffline = camp.status === 'offline'
  const condition = shortCardCondition(evaluation)

  return (
    <Link
      to={`/camp/${camp.id}`}
      aria-label={`${shortCampLabel(camp.name)} — ${CAMP_STATUS_LABELS[camp.status]}`}
      className="group block h-full rounded-cw-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg"
    >
      <Card
        variant="interactive"
        padding="none"
        className={cn(
          'flex h-full flex-col overflow-hidden',
          camp.status === 'critical' && 'border-l-2 border-l-cw-status-critical',
          camp.status === 'warning' && 'border-l-2 border-l-cw-status-warning',
        )}
      >
        <div className="h-0.5 bg-cw-brand/0 transition-colors duration-200 group-hover:bg-cw-brand" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-cw-text transition-colors group-hover:text-cw-brand">
                {shortCampLabel(camp.name)}
              </h3>
              <p className="mt-0.5 truncate text-xs text-cw-text-muted">
                {camp.location}
              </p>
            </div>
            <StatusBadge
              status={camp.status}
              size="sm"
              label={CAMP_STATUS_LABELS[camp.status]}
              pulse={camp.status === 'critical'}
            />
          </div>

          <p className="text-xs leading-relaxed text-cw-text-muted">{condition}</p>

          <dl
            className={`grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-cw-border-subtle pt-3 ${isOffline ? 'opacity-50' : ''}`}
          >
            {METRIC_CARD_ORDER.map((key: MetricKey) => {
              const resource = evaluation.resources.find((item) => item.metric === key)
              const highlighted =
                resource && resource.status !== 'online'
              return (
                <div key={key}>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
                    {METRIC_SHORT_LABELS[key]}
                  </dt>
                  <dd
                    className={cn(
                      'cw-telemetry-value mt-0.5 text-sm font-medium',
                      highlighted && resource.status === 'critical' && 'text-cw-status-critical',
                      highlighted && resource.status === 'warning' && 'text-cw-status-warning',
                      !highlighted && 'text-cw-text',
                    )}
                  >
                    {isOffline ? '—' : formatMetricDisplay(camp.metrics[key])}
                  </dd>
                </div>
              )
            })}
          </dl>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-cw-border-subtle pt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-cw-text-dim">
              <Clock className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              {isOffline ? 'Communication unavailable' : formatDataFreshness(camp.lastUpdated)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cw-text-muted">
              View Camp
              <ChevronRight
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
