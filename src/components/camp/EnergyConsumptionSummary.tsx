import { BatteryCharging } from 'lucide-react'
import type { EnergyConsumption } from '@/types'
import { cn, formatEnergyKwh, getEnergyConsumptionPeriods } from '@/utils'

export interface EnergyConsumptionSummaryProps {
  energy: EnergyConsumption
  className?: string
}

/**
 * Period energy totals (kWh) — companion to instantaneous apparent power (kVA).
 * Uses telemetry blue accent; never brand/alarm red.
 */
export function EnergyConsumptionSummary({
  energy,
  className,
}: EnergyConsumptionSummaryProps) {
  return (
    <div
      className={cn(
        'border-t border-cw-border-subtle pt-4 lg:border-t-0 lg:pt-0',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <BatteryCharging
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: 'var(--cw-telemetry-blue)' }}
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cw-text-muted">
          Energy Consumption
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {getEnergyConsumptionPeriods().map(({ key, label, detail }) => (
          <div
            key={key}
            className="rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated px-3 py-2.5"
          >
            <dt className="text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
              {label}
              <span className="mt-0.5 block font-normal normal-case tracking-normal">
                {detail}
              </span>
            </dt>
            <dd className="cw-telemetry-value mt-1 text-sm font-semibold tabular-nums text-cw-text">
              {formatEnergyKwh(energy[key])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
