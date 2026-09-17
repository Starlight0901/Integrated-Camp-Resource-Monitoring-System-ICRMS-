import type { Alarm, Camp } from '@/types'
import { getActiveAlarms } from '@/data/alarmDerivation'
import { sortCampsByDisplayOrder } from '@/utils/homepage'
import { evaluateCamp } from './campEvaluation'
import { fleetStatement } from './messages'
import type { AttentionItem, CampEvaluation, FleetEvaluation } from './types'

function findAlarmTimestamp(
  alarms: Alarm[],
  campId: string,
  metric: AttentionItem['resource']['metric'],
): string | null {
  const match = getActiveAlarms(alarms).find(
    (alarm) => alarm.campId === campId && alarm.metric === metric,
  )
  return match?.timestamp ?? null
}

function severityRank(status: CampEvaluation['status']): number {
  if (status === 'critical') return 3
  if (status === 'warning') return 2
  if (status === 'offline') return 1
  return 0
}

export function evaluateFleet(camps: Camp[], alarms: Alarm[] = []): FleetEvaluation {
  const campEvaluations = sortCampsByDisplayOrder(camps).map(evaluateCamp)

  const normalCount = campEvaluations.filter((camp) => camp.status === 'online').length
  const warningCount = campEvaluations.filter((camp) => camp.status === 'warning').length
  const criticalCount = campEvaluations.filter((camp) => camp.status === 'critical').length
  const offlineCount = campEvaluations.filter((camp) => camp.status === 'offline').length

  const attentionItems: AttentionItem[] = campEvaluations.flatMap((camp) =>
    camp.attentionResources.map((resource) => ({
      campId: camp.campId,
      campName: camp.campName,
      campStatus: camp.status,
      lastUpdated: camp.lastUpdated,
      resource,
      timestamp:
        findAlarmTimestamp(alarms, camp.campId, resource.metric) ?? camp.lastUpdated,
    })),
  )

  attentionItems.sort((a, b) => {
    const severity = severityRank(b.campStatus) - severityRank(a.campStatus)
    if (severity !== 0) return severity
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return {
    totalCamps: campEvaluations.length,
    normalCount,
    warningCount,
    criticalCount,
    offlineCount,
    statement: fleetStatement(warningCount, criticalCount, offlineCount),
    attentionItems,
    campEvaluations,
  }
}
