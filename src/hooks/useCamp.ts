import { useCallback, useEffect, useState } from 'react'
import { telemetryService, initialAsyncState } from '@/services'
import type { Camp } from '@/types'
import { useTelemetryRefresh } from './useTelemetryRefresh'

export function useCamp(campId: string | undefined) {
  const [state, setState] = useState(initialAsyncState<Camp | null>(null))
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((value) => value + 1), [])
  useTelemetryRefresh(refetch)

  useEffect(() => {
    if (!campId) {
      setState({ data: null, loading: false, error: null })
      return
    }

    let cancelled = false
    // Only show loading on first fetch / camp change — not on live simulator ticks
    setState((previous) => ({
      ...previous,
      loading: previous.data?.id !== campId,
    }))

    telemetryService
      .getCamp(campId)
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load camp'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [campId, tick])

  return state
}
