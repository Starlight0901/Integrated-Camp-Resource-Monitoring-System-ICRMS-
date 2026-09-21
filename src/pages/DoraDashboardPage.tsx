import { useParams } from 'react-router-dom'
import { DoraDashboardView } from '@/components/dora'
import { useDora } from '@/hooks'

export function DoraDashboardPage() {
  const { doraId } = useParams<{ doraId: string }>()
  const dora = useDora(doraId)
  return <DoraDashboardView dora={dora} />
}
