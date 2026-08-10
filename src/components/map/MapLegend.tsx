import { MapPin } from 'lucide-react'

export interface MapLegendProps {
  campCount: number
  activeAlarmCount: number
}

export function MapLegend({ campCount, activeAlarmCount }: MapLegendProps) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] sm:bottom-4 sm:right-4">
      <div className="pointer-events-auto rounded-cw-md border border-cw-border/80 bg-cw-surface/92 px-3 py-2.5 shadow-cw-card backdrop-blur-sm">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cw-text-muted">
          <MapPin className="h-3 w-3 text-cw-text-dim" strokeWidth={1.75} />
          Sri Lanka
        </p>
        <p className="mt-1 text-[11px] text-cw-text-dim">
          {campCount} sites · {activeAlarmCount} alarm{activeAlarmCount === 1 ? '' : 's'}
        </p>

        <ul className="mt-2.5 hidden items-center gap-3 border-t border-cw-border-subtle pt-2.5 sm:flex">
          <li className="flex items-center gap-1.5 text-[10px] text-cw-text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-cw-status-normal" />
            Online
          </li>
          <li className="flex items-center gap-1.5 text-[10px] text-cw-text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-cw-status-warning" />
            Warning
          </li>
          <li className="flex items-center gap-1.5 text-[10px] text-cw-text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-cw-status-critical" />
            Critical
          </li>
          <li className="flex items-center gap-1.5 text-[10px] text-cw-text-dim">
            <span className="h-2 w-2 rounded-full border border-cw-status-warning/40 bg-cw-status-warning/10" />
            Alarm
          </li>
        </ul>
      </div>
    </div>
  )
}
