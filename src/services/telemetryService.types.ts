import type {
  Alarm,
  Camp,
  CampMetrics,
  MetricKey,
  TelemetryPoint,
} from '@/types'

/** Time window for historical telemetry queries. */
export type TelemetryRange = '7d' | '48h' | '24h'

export interface CurrentTelemetry {
  campId: string
  timestamp: string
  metrics: CampMetrics
}

export interface HistoricalTelemetry {
  campId: string
  metric: MetricKey
  range: TelemetryRange
  points: TelemetryPoint[]
  /** Reading at the active timeline position — matches dashboard cards. */
  currentValue: number
  currentTimestamp: string
}

/**
 * Abstraction over camp telemetry and alarm data.
 * UI and hooks depend on this interface — not on dummy generators or API clients.
 */
export interface TelemetryService {
  getCamps(): Promise<Camp[]>
  getCamp(campId: string): Promise<Camp | null>
  getCurrentTelemetry(campId: string): Promise<CurrentTelemetry | null>
  getHistoricalTelemetry(
    campId: string,
    metric: MetricKey,
    range?: TelemetryRange,
  ): Promise<HistoricalTelemetry>
  getActiveAlarms(campId?: string): Promise<Alarm[]>
  /** Ms until the next live reading refresh (demo implementations). */
  getMsUntilNextRefresh?(): number
}

export interface AsyncState<T> {
  data: T
  loading: boolean
  error: Error | null
}

export const initialAsyncState = <T>(data: T): AsyncState<T> => ({
  data,
  loading: true,
  error: null,
})

export const EMPTY_HISTORICAL_TELEMETRY: HistoricalTelemetry = {
  campId: '',
  metric: 'apparentPower',
  range: '7d',
  points: [],
  currentValue: 0,
  currentTimestamp: '',
}
