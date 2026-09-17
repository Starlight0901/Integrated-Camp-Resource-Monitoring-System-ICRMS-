import type { Alarm } from '@/types'
import { cn, getAlarmSeverityStyle, formatTelemetryByUnit, formatTime } from '@/utils'
import { evaluateResource } from '@/monitoring'

export interface AlarmListItemProps {
  alarm: Alarm
  onSelect: (alarm: Alarm) => void
}

export function AlarmListItem({ alarm, onSelect }: AlarmListItemProps) {
  const style = getAlarmSeverityStyle(alarm.severity)
  const evaluation = evaluateResource(alarm.metric, alarm.currentValue, alarm.unit)

  return (
    <button
      type="button"
      onClick={() => onSelect(alarm)}
      className={cn(
        'w-full border-b border-cw-border-subtle px-4 py-3.5 text-left transition-colors duration-200',
        'hover:bg-cw-surface-hover focus-visible:bg-cw-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cw-accent/40',
        alarm.severity === 'critical' && 'border-l-2 border-l-cw-status-critical',
        alarm.severity === 'warning' && 'border-l-2 border-l-cw-status-warning',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-cw-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            style.badge,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden />
          {alarm.severity}
        </span>
        <time dateTime={alarm.timestamp} className="text-[11px] tabular-nums text-cw-text-dim">
          {formatTime(alarm.timestamp)}
        </time>
      </div>

      <p className="mt-2 text-sm font-semibold text-cw-text">{alarm.campName}</p>
      <p className="mt-0.5 text-xs text-cw-text-muted">{alarm.metricLabel}</p>

      <p className="cw-telemetry-value mt-2 text-base font-semibold text-cw-text">
        {formatTelemetryByUnit(alarm.currentValue, alarm.unit)}
      </p>
      {evaluation.threshold != null && (
        <p className="mt-0.5 text-xs text-cw-text-dim">
          Threshold: {formatTelemetryByUnit(evaluation.threshold, evaluation.unit)}
        </p>
      )}

      <p className="mt-1 text-xs text-cw-text-muted">{evaluation.message}</p>
      {evaluation.recommendation && (
        <p className="mt-1 text-xs text-cw-text-dim">{evaluation.recommendation}</p>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
        View Camp
      </p>
    </button>
  )
}
