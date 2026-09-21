import type { Dora } from '@/types'
import { Card } from '@/components/ui'
import { cn, formatTelemetryByUnit } from '@/utils'
import { evaluateDora } from '@/monitoring'

export interface DoraCurrentReadingsProps {
  dora: Dora
}

export function DoraCurrentReadings({ dora }: DoraCurrentReadingsProps) {
  const evaluation = evaluateDora(dora)

  return (
    <section aria-label="Current readings" className="grid gap-4 sm:grid-cols-2">
      {evaluation.resources.map((resource) => (
        <Card key={resource.resource} padding="md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-cw-text-dim">
            {resource.label}
          </p>
          <p
            className={cn(
              'cw-telemetry-value mt-1.5 text-2xl font-semibold',
              resource.status === 'critical' && 'text-cw-status-critical',
              resource.status === 'warning' && 'text-cw-status-warning',
              resource.status === 'normal' && 'text-cw-text',
            )}
          >
            {formatTelemetryByUnit(resource.value, resource.unit)}
          </p>
          <p className="mt-1.5 text-xs text-cw-text-muted">{resource.reason}</p>
        </Card>
      ))}
    </section>
  )
}
