import { useMemo } from 'react'
import { deriveAlarmsFromDoras } from '@/data/doraAlarmDerivation'
import type { SystemAlarm } from '@/types'
import { useAlarms } from './useAlarms'
import { useDoras } from './useDoras'

function mergeSystemAlarms(
  campAlarms: SystemAlarm[],
  doraAlarms: SystemAlarm[],
): SystemAlarm[] {
  return [...campAlarms, ...doraAlarms].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

/** Camp alarms from the existing service, plus DORA alarms from live evaluation. */
export function useSystemAlarms() {
  const campAlarmsState = useAlarms()
  const doras = useDoras()
  const doraAlarms = useMemo(() => deriveAlarmsFromDoras(doras), [doras])

  const data = useMemo(
    () => mergeSystemAlarms(campAlarmsState.data ?? [], doraAlarms),
    [campAlarmsState.data, doraAlarms],
  )

  return {
    ...campAlarmsState,
    data,
  }
}
