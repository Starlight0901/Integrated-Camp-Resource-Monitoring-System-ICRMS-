import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, SectionHeader } from '@/components/ui'
import { DoraStatusBadge } from './DoraStatusBadge'
import { cn, formatTelemetryByUnit } from '@/utils'
import type { DoraAttentionItem } from '@/monitoring'

export interface DoraAttentionRequiredProps {
  items: DoraAttentionItem[]
}

export function DoraAttentionRequired({ items }: DoraAttentionRequiredProps) {
  return (
    <section aria-label="Attention required" className="animate-cw-fade-in">
      <SectionHeader
        title="Attention Required"
        subtitle={
          items.length === 0
            ? 'No DORAs currently outside normal range'
            : `${items.length} condition${items.length === 1 ? '' : 's'} currently outside normal range`
        }
        className="mb-4"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All DORAs are normal"
          description="No warning or critical conditions are active. Monitored fuel and power readings are within range."
          className="py-10"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <DoraAttentionCard
              key={`${item.doraId}-${item.resource.resource}`}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function DoraAttentionCard({ item }: { item: DoraAttentionItem }) {
  const { resource } = item
  const isCritical = resource.status === 'critical'
  const thresholdKind =
    resource.thresholdKind === 'critical' ? 'Critical threshold' : 'Warning threshold'

  return (
    <Card
      padding="none"
      className={cn(
        'overflow-hidden',
        isCritical
          ? 'border-l-2 border-l-cw-status-critical'
          : 'border-l-2 border-l-cw-status-warning',
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-cw-text">
              {item.doraName}
            </h3>
            <p className="mt-0.5 text-xs text-cw-text-muted">{resource.label}</p>
          </div>
          <DoraStatusBadge
            status={item.doraStatus}
            size="sm"
            pulse={item.doraStatus === 'critical'}
          />
        </div>

        <p className="text-sm text-cw-text">{resource.reason}</p>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-cw-text-dim">{resource.label}</dt>
            <dd className="cw-telemetry-value mt-0.5 font-semibold text-cw-text">
              {formatTelemetryByUnit(resource.value, resource.unit)}
            </dd>
          </div>
          {resource.threshold != null && (
            <div>
              <dt className="text-cw-text-dim">{thresholdKind}</dt>
              <dd className="cw-telemetry-value mt-0.5 font-semibold text-cw-text">
                {formatTelemetryByUnit(resource.threshold, resource.unit)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-1 flex items-center justify-end border-t border-cw-border-subtle pt-3">
          <Link
            to={`/doras/${item.doraId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cw-text transition-colors hover:text-cw-brand"
          >
            View DORA
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
