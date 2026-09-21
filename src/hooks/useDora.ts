import { useMemo } from 'react'
import type { Dora } from '@/types'
import { useDoras } from './useDoras'

export function useDora(doraId: string | undefined): Dora | null {
  const doras = useDoras()
  return useMemo(
    () => (doraId ? (doras.find((dora) => dora.id === doraId) ?? null) : null),
    [doras, doraId],
  )
}
