import { useEffect } from 'react'
import {
  getTelemetryRefreshIntervalMs,
  telemetryService,
} from '@/services'

/**
 * Re-fetches when the telemetry service advances to the next reading.
 * Aligns to the live simulator cadence (1 minute) so all views update in sync.
 */
export function useTelemetryRefresh(onTick: () => void): void {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let intervalId: ReturnType<typeof setInterval> | undefined

    const intervalMs = getTelemetryRefreshIntervalMs()

    const schedule = () => {
      const msUntilTick =
        telemetryService.getMsUntilNextRefresh?.() ?? intervalMs

      timeoutId = setTimeout(() => {
        onTick()
        intervalId = setInterval(onTick, intervalMs)
      }, msUntilTick)
    }

    schedule()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [onTick])
}
