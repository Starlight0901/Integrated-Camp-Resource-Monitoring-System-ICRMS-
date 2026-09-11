import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import type { Camp } from '@/types'
import { StatusBadge } from '@/components/ui'
import { isLiveTelemetrySimulatorActive } from '@/data'
import { formatLastUpdated, CAMP_STATUS_LABELS } from '@/utils'

export interface CampDashboardHeaderProps {
  camp: Camp
}

export function CampDashboardHeader({ camp }: CampDashboardHeaderProps) {
  const isHealthy = camp.status === 'online'
  const liveSim = isLiveTelemetrySimulatorActive()

  return (
    <header className="space-y-4 border-b border-cw-border-subtle pb-6">
      <nav aria-label="Camp navigation">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-cw-text-muted transition-colors hover:text-cw-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Overview
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-cw-text">
          {camp.name}
        </h1>
        <StatusBadge
          status={camp.status}
          size="md"
          label={CAMP_STATUS_LABELS[camp.status]}
          pulse={camp.status === 'critical'}
        />
        {liveSim && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-cw-text-dim"
            title="Telemetry updates once per minute"
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: 'var(--cw-telemetry-green)' }}
              aria-hidden
            />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cw-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Last updated{' '}
          <time dateTime={camp.lastUpdated} className="font-medium text-cw-text">
            {formatLastUpdated(camp.lastUpdated)}
          </time>
        </span>
        <span className="hidden text-cw-border sm:inline" aria-hidden>
          ·
        </span>
        <span>{camp.location}</span>
        {isHealthy && (
          <>
            <span className="hidden text-cw-border sm:inline" aria-hidden>
              ·
            </span>
            <span className="text-cw-status-normal">All metrics within normal range</span>
          </>
        )}
      </div>
    </header>
  )
}
