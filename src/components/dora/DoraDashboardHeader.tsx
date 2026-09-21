import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import type { Dora } from '@/types'
import { evaluateDora } from '@/monitoring'
import { DoraStatusBadge } from './DoraStatusBadge'
import { formatDoraCoordinates } from './formatDoraCoordinates'

export interface DoraDashboardHeaderProps {
  dora: Dora
}

export function DoraDashboardHeader({ dora }: DoraDashboardHeaderProps) {
  const evaluation = evaluateDora(dora)

  return (
    <header className="space-y-4 border-b border-cw-border-subtle pb-6">
      <nav aria-label="DORA navigation">
        <Link
          to="/doras"
          className="inline-flex items-center gap-1.5 text-sm text-cw-text-muted transition-colors hover:text-cw-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          DORA overview
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-cw-text">
          {dora.name}
        </h1>
        <DoraStatusBadge
          status={evaluation.status}
          size="md"
          pulse={evaluation.status === 'critical'}
        />
      </div>

      <p className="text-sm text-cw-text">{evaluation.summary}</p>

      <p className="flex flex-wrap items-center gap-1.5 text-sm text-cw-text-muted">
        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>Demo GPS</span>
        <span className="tabular-nums text-cw-text">
          {formatDoraCoordinates(dora.location)}
        </span>
      </p>
    </header>
  )
}
