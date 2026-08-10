import { useCallback, useEffect, useState } from 'react'
import {
  telemetryService,
  initialAsyncState,
  EMPTY_HISTORICAL_TELEMETRY,
  type HistoricalTelemetry,
  type TelemetryRange,
} from '@/services'
import type { MetricKey } from '@/types'
import { useTelemetryRefresh } from './useTelemetryRefresh'

export function useCampTelemetry(
  campId: string | undefined,
  metric: MetricKey,
  range: TelemetryRange = '7d',
) {
  const [state, setState] = useState(
    initialAsyncState<HistoricalTelemetry>(EMPTY_HISTORICAL_TELEMETRY),
  )
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((value) => value + 1), [])
  useTelemetryRefresh(refetch)

  useEffect(() => {
    if (!campId) {
      setState({ data: EMPTY_HISTORICAL_TELEMETRY, loading: false, error: null })
      return
    }

    let cancelled = false
    setState((previous) => ({ ...previous, loading: true }))

    telemetryService
      .getHistoricalTelemetry(campId, metric, range)
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: EMPTY_HISTORICAL_TELEMETRY,
            loading: false,
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load telemetry'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [campId, metric, range, tick])

  return state
}
