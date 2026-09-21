import type { useNavigate } from 'react-router-dom'
import type { Alarm, SystemAlarm } from '@/types'
import { isDoraAlarm } from '@/types'

export function navigateToAlarmCamp(
  navigate: ReturnType<typeof useNavigate>,
  alarm: Alarm,
): void {
  navigate(`/camp/${alarm.campId}?metric=${alarm.metric}`)
}

export function navigateToAlarm(
  navigate: ReturnType<typeof useNavigate>,
  alarm: SystemAlarm,
): void {
  if (isDoraAlarm(alarm)) {
    navigate(`/doras/${alarm.doraId}`)
    return
  }
  navigateToAlarmCamp(navigate, alarm)
}
