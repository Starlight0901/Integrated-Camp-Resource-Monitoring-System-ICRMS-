import type { SystemAlarm } from '@/types'
import { isDoraAlarm } from '@/types'
import { cn, getAlarmSeverityStyle, formatTelemetryByUnit, formatTime } from '@/utils'
import { evaluateResource } from '@/monitoring'

export interface AlarmListItemProps {
  alarm: SystemAlarm
  onSelect: (alarm: SystemAlarm) => void
}

export function AlarmListItem({ alarm, onSelect }: AlarmListItemProps) {
  const style = getAlarmSeverityStyle(alarm.severity)
  const isDora = isDoraAlarm(alarm)
  const campEvaluation = isDora
    ? null
    : evaluateResource(alarm.metric, alarm.currentValue, alarm.unit)
  const title = isDora ? alarm.doraName : alarm.campName
  const resourceLabel = isDora ? alarm.resourceLabel : alarm.metricLabel
  const sourceLabel = isDora ? 'DORA' : 'Camp'
  const actionLabel = isDora ? 'View DORA' : 'View Camp'
  const reason = isDora ? alarm.reason : campEvaluation?.message
  const recommendation = isDora ? null : campEvaluation?.recommendation
  const threshold = isDora ? alarm.threshold : campEvaluation?.threshold
  const unit = alarm.unit

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
        <span className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-cw-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              style.badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden />
            {alarm.severity}
          </span>
          <span className="rounded-cw-sm border border-cw-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cw-text-dim">
            {sourceLabel}
          </span>
        </span>
        <time dateTime={alarm.timestamp} className="text-[11px] tabular-nums text-cw-text-dim">
          {formatTime(alarm.timestamp)}
        </time>
      </div>

      <p className="mt-2 text-sm font-semibold text-cw-text">{title}</p>
      <p className="mt-0.5 text-xs text-cw-text-muted">{resourceLabel}</p>

      <p className="cw-telemetry-value mt-2 text-base font-semibold text-cw-text">
        {formatTelemetryByUnit(alarm.currentValue, unit)}
      </p>
      {threshold != null && (
        <p className="mt-0.5 text-xs text-cw-text-dim">
          Threshold: {formatTelemetryByUnit(threshold, unit)}
        </p>
      )}

      <p className="mt-1 text-xs text-cw-text-muted">{reason}</p>
      {recommendation && (
        <p className="mt-1 text-xs text-cw-text-dim">{recommendation}</p>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-cw-text-dim">
        {actionLabel}
      </p>
    </button>
  )
}
