import { Card } from '@/components/ui'
import type { FleetEvaluation } from '@/monitoring'

export interface SystemOverviewProps {
  fleet: FleetEvaluation
}

export function SystemOverview({ fleet }: SystemOverviewProps) {
  const countLine = [
    `${fleet.normalCount} Normal`,
    `${fleet.warningCount} Warning`,
    `${fleet.criticalCount} Critical`,
    fleet.offlineCount > 0 ? `${fleet.offlineCount} Offline` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section aria-label="System overview" className="animate-cw-fade-in">
      <Card padding="md" className="sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cw-text-dim">
              System Overview
            </p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-cw-text">
              {fleet.totalCamps} Camps Monitored
            </p>
            <p className="mt-1 text-sm text-cw-text-muted">{countLine}</p>
            <p className="mt-1 text-sm text-cw-text">{fleet.statement}</p>
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cw-status-normal" />
              <span className="tabular-nums font-medium text-cw-text">{fleet.normalCount}</span>
              <span className="text-cw-text-dim">Normal</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cw-status-warning" />
              <span className="tabular-nums font-medium text-cw-text">{fleet.warningCount}</span>
              <span className="text-cw-text-dim">Warning</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cw-status-critical" />
              <span className="tabular-nums font-medium text-cw-text">{fleet.criticalCount}</span>
              <span className="text-cw-text-dim">Critical</span>
            </li>
          </ul>
        </div>
      </Card>
    </section>
  )
}

