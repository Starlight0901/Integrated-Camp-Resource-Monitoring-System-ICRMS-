import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import type { Camp } from '@/types'
import { StatusBadge } from '@/components/ui'
import { CAMP_STATUS_LABELS, shortCampLabel } from '@/utils'

export interface CampMapPopupProps {
  camp: Camp
  alarmCount?: number
}

export function CampMapPopup({ camp, alarmCount = 0 }: CampMapPopupProps) {
  const navigate = useNavigate()

  return (
    <div className="camp-popup min-w-[220px]">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cw-text-dim" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-cw-text">{shortCampLabel(camp.name)}</h3>
          <p className="mt-0.5 text-xs text-cw-text-muted">{camp.location}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-cw-border-subtle pt-3">
        <StatusBadge
          status={camp.status}
          size="sm"
          label={CAMP_STATUS_LABELS[camp.status]}
          pulse={camp.status === 'critical'}
        />
        {alarmCount > 0 ? (
          <span className="text-[10px] font-medium text-cw-status-warning">
            {alarmCount} active alarm{alarmCount === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="text-[10px] text-cw-text-dim">
            {camp.latitude.toFixed(2)}°N, {camp.longitude.toFixed(2)}°E
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(`/camp/${camp.id}`)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-cw-md border border-cw-border bg-cw-bg-elevated px-3 py-2 text-xs font-medium text-cw-text transition-colors hover:border-cw-border hover:bg-cw-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30"
      >
        Open dashboard
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
