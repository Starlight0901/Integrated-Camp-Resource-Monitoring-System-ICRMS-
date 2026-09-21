import { DoraOverviewView } from '@/components/dora'
import { useDoras } from '@/hooks'

export function DorasPage() {
  const doras = useDoras()
  return <DoraOverviewView doras={doras} />
}
