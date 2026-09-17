import { Link } from 'react-router-dom'
import { Card, SectionHeader } from '@/components/ui'
import { cn, formatDataFreshness, getAlarmSeverityStyle, shortCampLabel } from '@/utils'
import type { ActivityEvent } from '@/monitoring'

export interface RecentActivityProps {
  events: ActivityEvent[]
}

export function RecentActivity({ events }: RecentActivityProps) {
  if (events.length === 0) return null

  return (
    <section aria-label="Recent activity" className="animate-cw-fade-in">
      <SectionHeader
        title="Recent Activity"
        subtitle="Alarm conditions derived from live telemetry"
        className="mb-4"
      />
      <Card padding="none">
        <ul className="divide-y divide-cw-border-subtle">
          {events.map((event) => {
            const style = getAlarmSeverityStyle(event.severity)
            return (
              <li key={event.id}>
                <Link
                  to={`/camp/${event.campId}`}
                  className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-cw-surface-hover"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cw-text">
                      {shortCampLabel(event.campName)}
                    </p>
                    <p className="mt-0.5 text-xs text-cw-text-muted">{event.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        'inline-flex rounded-cw-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        style.badge,
                      )}
                    >
                      {event.severity}
                    </span>
                    <time
                      dateTime={event.timestamp}
                      className="mt-1.5 block text-[10px] text-cw-text-dim"
                    >
                      {formatDataFreshness(event.timestamp)}
                    </time>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </section>
  )
}
