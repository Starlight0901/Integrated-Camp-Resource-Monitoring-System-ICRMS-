import type { Alarm } from '@/types'
import { getActiveAlarms } from '@/data/alarmDerivation'
import { activityMessage } from './messages'
import type { ActivityEvent } from './types'

/** Derive concise recent activity from actual active alarms — no synthetic events. */
export function buildRecentActivity(alarms: Alarm[], limit = 6): ActivityEvent[] {
  return getActiveAlarms(alarms)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, limit)
    .map((alarm) => ({
      id: alarm.id,
      type: 'alarm-triggered' as const,
      campId: alarm.campId,
      campName: alarm.campName,
      metric: alarm.metric,
      metricLabel: alarm.metricLabel,
      severity: alarm.severity,
      message: activityMessage(alarm.metricLabel, alarm.severity),
      timestamp: alarm.timestamp,
    }))
}
