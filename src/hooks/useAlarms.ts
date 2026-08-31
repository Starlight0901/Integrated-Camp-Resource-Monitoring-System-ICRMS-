import { useCallback, useEffect, useRef, useState } from 'react'
import { telemetryService, initialAsyncState } from '@/services'
import type { Alarm } from '@/types'
import { useTelemetryRefresh } from './useTelemetryRefresh'

export function useAlarms(campId?: string) {
  const [state, setState] = useState(initialAsyncState<Alarm[]>([]))
  const [tick, setTick] = useState(0)
  const hydratedForCamp = useRef<string | undefined>(undefined)

  const refetch = useCallback(() => setTick((value) => value + 1), [])
  useTelemetryRefresh(refetch)

  useEffect(() => {
    let cancelled = false
    const needsLoading = hydratedForCamp.current !== campId
    setState((previous) => ({
      ...previous,
      loading: needsLoading,
    }))

    telemetryService
      .getActiveAlarms(campId)
      .then((data) => {
        if (!cancelled) {
          hydratedForCamp.current = campId
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error:
              error instanceof Error ? error : new Error('Failed to load alarms'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [campId, tick])

  return state
}
