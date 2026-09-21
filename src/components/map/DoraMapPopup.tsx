import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Dora } from '@/types'
import { formatTelemetryByUnit } from '@/utils'
import { evaluateDora } from '@/monitoring'
import { DoraStatusBadge } from '@/components/dora/DoraStatusBadge'
import { formatDoraCoordinates } from '@/components/dora/formatDoraCoordinates'

export interface DoraMapPopupProps {
  dora: Dora
}

export function DoraMapPopup({ dora }: DoraMapPopupProps) {
  const navigate = useNavigate()
  const evaluation = evaluateDora(dora)
  const fuel = evaluation.resources.find((item) => item.resource === 'fuelLevel')
  const power = evaluation.resources.find(
    (item) => item.resource === 'powerConsumption',
  )

  return (
    <div className="camp-popup min-w-[220px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-cw-text-dim">
            DORA
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-cw-text">{dora.name}</h3>
        </div>
        <DoraStatusBadge
          status={evaluation.status}
          size="sm"
          pulse={evaluation.status === 'critical'}
        />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-cw-border-subtle pt-3">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
            Fuel
          </dt>
          <dd className="cw-telemetry-value mt-0.5 text-sm font-semibold text-cw-text">
            {fuel
              ? formatTelemetryByUnit(fuel.value, fuel.unit)
              : formatTelemetryByUnit(dora.fuelLevel, 'L')}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
            Power
          </dt>
          <dd className="cw-telemetry-value mt-0.5 text-sm font-semibold text-cw-text">
            {power
              ? formatTelemetryByUnit(power.value, power.unit)
              : formatTelemetryByUnit(dora.powerConsumption, 'kVA')}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] tabular-nums text-cw-text-muted">
        {formatDoraCoordinates(dora.location)}
      </p>

      <button
        type="button"
        onClick={() => navigate(`/doras/${dora.id}`)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-cw-md border border-cw-border bg-cw-bg-elevated px-3 py-2 text-xs font-medium text-cw-text transition-colors hover:border-cw-border hover:bg-cw-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
      >
        View DORA
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
