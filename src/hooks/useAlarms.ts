import { useCallback, useEffect, useState } from 'react'
import { telemetryService, initialAsyncState } from '@/services'
import type { Alarm } from '@/types'
import { useTelemetryRefresh } from './useTelemetryRefresh'

export function useAlarms(campId?: string) {
  const [state, setState] = useState(initialAsyncState<Alarm[]>([]))
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((value) => value + 1), [])
  useTelemetryRefresh(refetch)

  useEffect(() => {
    let cancelled = false
    setState((previous) => ({ ...previous, loading: true }))

    telemetryService
      .getActiveAlarms(campId)
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
