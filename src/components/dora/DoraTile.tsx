import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import type { Dora, DoraResourceKey } from '@/types'
import { Card } from '@/components/ui'
import { DoraStatusBadge } from './DoraStatusBadge'
import { cn, formatTelemetryByUnit } from '@/utils'
import { doraShortCardCondition } from '@/monitoring'
import type { DoraEvaluation } from '@/monitoring'
import { formatDoraCoordinates } from './formatDoraCoordinates'

const TILE_RESOURCE_LABELS: Record<DoraResourceKey, string> = {
  fuelLevel: 'Fuel',
  powerConsumption: 'Power',
}

export interface DoraTileProps {
  dora: Dora
  evaluation: DoraEvaluation
}

export function DoraTile({ dora, evaluation }: DoraTileProps) {
  const condition = doraShortCardCondition(evaluation)

  return (
    <Link
      to={`/doras/${dora.id}`}
      id={dora.id}
      aria-label={`${dora.name} — ${evaluation.status}`}
      className="group block h-full scroll-mt-24 rounded-cw-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg"
    >
      <Card
        variant="interactive"
        padding="none"
        className={cn(
          'flex h-full flex-col overflow-hidden',
          evaluation.status === 'critical' && 'border-l-2 border-l-cw-status-critical',
          evaluation.status === 'warning' && 'border-l-2 border-l-cw-status-warning',
        )}
      >
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-cw-text transition-colors group-hover:text-cw-brand">
                {dora.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-cw-text-muted">
                Demo GPS location
              </p>
            </div>
            <DoraStatusBadge
              status={evaluation.status}
              size="sm"
              pulse={evaluation.status === 'critical'}
            />
          </div>

          <p className="text-xs leading-relaxed text-cw-text-muted">{condition}</p>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-cw-border-subtle pt-3">
            {evaluation.resources.map((resource) => {
              const highlighted = resource.status !== 'normal'
              return (
                <div key={resource.resource}>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
                    {TILE_RESOURCE_LABELS[resource.resource]}
                  </dt>
                  <dd
                    className={cn(
                      'cw-telemetry-value mt-0.5 text-sm font-medium',
                      highlighted &&
                        resource.status === 'critical' &&
                        'text-cw-status-critical',
                      highlighted &&
                        resource.status === 'warning' &&
                        'text-cw-status-warning',
                      !highlighted && 'text-cw-text',
                    )}
                  >
                    {formatTelemetryByUnit(resource.value, resource.unit)}
                  </dd>
                </div>
              )
            })}
          </dl>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-cw-border-subtle pt-3 text-[11px] text-cw-text-dim">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span className="truncate tabular-nums">
                {formatDoraCoordinates(dora.location)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-cw-text-muted">
              View DORA
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
