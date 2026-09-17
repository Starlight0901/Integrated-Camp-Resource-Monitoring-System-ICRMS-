import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Camp } from '@/types'
import { StatusBadge } from '@/components/ui'
import {
  CAMP_STATUS_LABELS,
  formatTelemetryByUnit,
  shortCampLabel,
} from '@/utils'
import { evaluateCamp } from '@/monitoring'

export interface CampMapPopupProps {
  camp: Camp
  alarmCount?: number
}

export function CampMapPopup({ camp }: CampMapPopupProps) {
  const navigate = useNavigate()
  const evaluation = evaluateCamp(camp)
  const issue = evaluation.primaryIssue

  return (
    <div className="camp-popup min-w-[220px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-cw-text">{shortCampLabel(camp.name)}</h3>
          <p className="mt-0.5 text-xs text-cw-text-muted">{camp.location}</p>
        </div>
        <StatusBadge
          status={camp.status}
          size="sm"
          label={CAMP_STATUS_LABELS[camp.status]}
          pulse={camp.status === 'critical'}
        />
      </div>

      <div className="mt-3 border-t border-cw-border-subtle pt-3">
        {issue ? (
          <>
            <p className="cw-telemetry-value text-sm font-semibold text-cw-text">
              {issue.label}: {formatTelemetryByUnit(issue.value, issue.unit)}
            </p>
            <p className="mt-1 text-xs text-cw-text-muted">{issue.message}</p>
          </>
        ) : (
          <p className="text-xs text-cw-text-muted">{evaluation.summary}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(`/camp/${camp.id}`)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-cw-md border border-cw-border bg-cw-bg-elevated px-3 py-2 text-xs font-medium text-cw-text transition-colors hover:border-cw-border hover:bg-cw-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
      >
        View Camp
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
