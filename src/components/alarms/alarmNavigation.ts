import type { useNavigate } from 'react-router-dom'
import type { Alarm } from '@/types'

export function navigateToAlarmCamp(
  navigate: ReturnType<typeof useNavigate>,
  alarm: Alarm,
): void {
  navigate(`/camp/${alarm.campId}?metric=${alarm.metric}`)
}
