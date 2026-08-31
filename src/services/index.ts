import { dummyTelemetryService } from './dummyTelemetryService'
import type { TelemetryService } from './telemetryService.types'

/**
 * Active telemetry service.
 *
 * Today: deterministic dummy data (`dummyTelemetryService`).
 * Later:   replace with `apiTelemetryService` — no UI changes required.
 */
export const telemetryService: TelemetryService = dummyTelemetryService

export { dummyTelemetryService, DummyTelemetryService } from './dummyTelemetryService'
export type {
  TelemetryService,
  TelemetryRange,
  CurrentTelemetry,
  HistoricalTelemetry,
  AsyncState,
} from './telemetryService.types'
export {
  TELEMETRY_INTERVAL_MS,
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_TELEMETRY_SIMULATOR,
  getTelemetryRefreshIntervalMs,
} from './dummyTelemetryService'
export { initialAsyncState, EMPTY_HISTORICAL_TELEMETRY } from './telemetryService.types'
