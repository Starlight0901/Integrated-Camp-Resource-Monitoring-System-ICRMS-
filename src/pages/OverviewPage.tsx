import { OverviewView } from '@/components/overview/OverviewView'
import { useAlarms, useCamps } from '@/hooks'

export function OverviewPage() {
  const campsState = useCamps()
  const alarmsState = useAlarms()

  return (
    <OverviewView campsState={campsState} alarmsState={alarmsState} />
  )
}
