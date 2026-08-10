import { useEffect } from 'react'
import { TELEMETRY_INTERVAL_MS, telemetryService } from '@/services'

/**
 * Re-fetches when the telemetry service advances to the next reading.
 * Aligns to the service refresh schedule so all views update in sync.
 */
export function useTelemetryRefresh(onTick: () => void): void {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let intervalId: ReturnType<typeof setInterval> | undefined

    const intervalMs = TELEMETRY_INTERVAL_MS

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
