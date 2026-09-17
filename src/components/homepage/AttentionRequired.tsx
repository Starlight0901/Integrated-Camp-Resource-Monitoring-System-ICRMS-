import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, SectionHeader, StatusBadge } from '@/components/ui'
import {
  CAMP_STATUS_LABELS,
  cn,
  formatDataFreshness,
  formatTelemetryByUnit,
  shortCampLabel,
} from '@/utils'
import type { AttentionItem } from '@/monitoring'

export interface AttentionRequiredProps {
  items: AttentionItem[]
}

export function AttentionRequired({ items }: AttentionRequiredProps) {
  if (items.length === 0) return null

  return (
    <section aria-label="Attention required" className="animate-cw-fade-in">
      <SectionHeader
        title="Attention Required"
        subtitle={`${items.length} condition${items.length === 1 ? '' : 's'} currently outside normal range`}
        className="mb-4"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <AttentionCard key={`${item.campId}-${item.resource.metric}`} item={item} />
        ))}
      </div>
    </section>
  )
}

function AttentionCard({ item }: { item: AttentionItem }) {
  const { resource } = item
  const isCritical = resource.status === 'critical'

  return (
    <Card
      padding="none"
      className={cn(
        'overflow-hidden',
        isCritical ? 'border-l-2 border-l-cw-status-critical' : 'border-l-2 border-l-cw-status-warning',
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-cw-text">
              {shortCampLabel(item.campName)} Camp
            </h3>
            <p className="mt-0.5 text-xs text-cw-text-muted">{resource.label}</p>
          </div>
          <StatusBadge
            status={item.campStatus}
            size="sm"
            label={CAMP_STATUS_LABELS[item.campStatus]}
            pulse={item.campStatus === 'critical'}
          />
        </div>

        <p className="text-sm text-cw-text">{resource.message}</p>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-cw-text-dim">{resource.label}</dt>
            <dd className="cw-telemetry-value mt-0.5 font-semibold text-cw-text">
              {formatTelemetryByUnit(resource.value, resource.unit)}
            </dd>
          </div>
          {resource.threshold != null && (
            <div>
              <dt className="text-cw-text-dim">
                {resource.status === 'critical' ? 'Critical threshold' : 'Warning threshold'}
              </dt>
              <dd className="cw-telemetry-value mt-0.5 font-semibold text-cw-text">
                {formatTelemetryByUnit(resource.threshold, resource.unit)}
              </dd>
            </div>
          )}
        </dl>

        {resource.recommendation && (
          <p className="text-xs text-cw-text-muted">{resource.recommendation}</p>
        )}

        <div className="mt-1 flex items-center justify-between gap-3 border-t border-cw-border-subtle pt-3">
          <time dateTime={item.timestamp} className="text-[11px] text-cw-text-dim">
            {formatDataFreshness(item.timestamp)}
          </time>
          <Link
            to={`/camp/${item.campId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cw-text transition-colors hover:text-cw-brand"
          >
            View Camp
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
