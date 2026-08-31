import { useCallback, useEffect, useState } from 'react'
import { telemetryService, initialAsyncState } from '@/services'
import type { Camp } from '@/types'
import { useTelemetryRefresh } from './useTelemetryRefresh'

export function useCamps() {
  const [state, setState] = useState(initialAsyncState<Camp[]>([]))
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((value) => value + 1), [])
  useTelemetryRefresh(refetch)

  useEffect(() => {
    let cancelled = false
    // Keep existing camps visible during live simulator refreshes
    setState((previous) => ({
      ...previous,
      loading: previous.data.length === 0,
    }))

    telemetryService
      .getCamps()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load camps'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return state
}
