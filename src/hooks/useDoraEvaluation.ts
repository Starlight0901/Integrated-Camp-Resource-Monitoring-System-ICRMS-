import { useMemo } from 'react'
import type { Dora } from '@/types'
import { evaluateDora, evaluateDoraGroup } from '@/monitoring/doraEvaluation'

export function useDoraEvaluation(dora: Dora | null | undefined) {
  return useMemo(() => (dora ? evaluateDora(dora) : null), [dora])
}

export function useDoraEvaluations(doras: Dora[]) {
  return useMemo(() => evaluateDoraGroup(doras), [doras])
}
