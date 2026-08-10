import type { Alarm, MetricKey } from '@/types'
import { AlertTriangle } from 'lucide-react'
import { Card, SectionHeader } from '@/components/ui'
import { getActiveAlarms } from '@/utils/alarms'
import { cn, getAlarmSeverityStyle, formatTelemetryByUnit, formatTime } from '@/utils'

export interface CampAlarmsSectionProps {
  campId: string
  alarms: Alarm[]
  onAlarmClick: (metric: MetricKey) => void
}

export function CampAlarmsSection({
  campId,
  alarms,
  onAlarmClick,
}: CampAlarmsSectionProps) {
  const campAlarms = getActiveAlarms(alarms).filter(
    (alarm) => alarm.campId === campId,
  )

  if (campAlarms.length === 0) return null

  return (
    <section aria-label="Active alarms">
      <SectionHeader
        title="Requires Attention"
        subtitle={`${campAlarms.length} active alarm${campAlarms.length === 1 ? '' : 's'} at this camp`}
        className="mb-4"
      />
      <Card padding="none" variant="raised">
        <ul className="divide-y divide-cw-border-subtle">
          {campAlarms.map((alarm) => {
            const style = getAlarmSeverityStyle(alarm.severity)
            return (
              <li key={alarm.id}>
                <button
                  type="button"
                  onClick={() => onAlarmClick(alarm.metric)}
                  className={cn(
                    'flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors',
                    'hover:bg-cw-surface-hover focus-visible:bg-cw-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cw-accent/40',
                    alarm.severity === 'critical' && 'border-l-2 border-l-cw-status-critical',
                    alarm.severity === 'warning' && 'border-l-2 border-l-cw-status-warning',
                  )}
                >
                  <AlertTriangle
                    className={cn('h-4 w-4 shrink-0', style.text)}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cw-text">{alarm.metricLabel}</p>
                    <p className="mt-0.5 text-xs text-cw-text-muted">
                      {alarm.thresholdDescription}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="cw-telemetry-value text-sm font-semibold text-cw-text">
                      {formatTelemetryByUnit(alarm.currentValue, alarm.unit)}
                    </p>
                    <time
                      dateTime={alarm.timestamp}
                      className="mt-0.5 block text-[10px] uppercase tracking-wider text-cw-text-dim"
                    >
                      {formatTime(alarm.timestamp)}
                    </time>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-cw-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      style.badge,
                    )}
                  >
                    {alarm.severity}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>
    </section>
  )
}
