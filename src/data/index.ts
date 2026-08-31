export { dummyCamps, dummyTelemetry, dummyAlarms, getLiveTelemetrySnapshot, telemetryTimestamps } from './generateDataset'
export { buildMetric, buildCampMetrics } from './helpers'
export {
  CAMP_PROFILES,
  DEMO_LIVE_TELEMETRY,
  LIVE_TELEMETRY_SIMULATOR,
  LIVE_SIMULATOR_INTERVAL_MS,
  LIVE_SIMULATOR_MAX_DELTA,
  TELEMETRY_INTERVAL_MS,
  TELEMETRY_POINT_COUNT,
  TELEMETRY_DAYS,
  ALARM_THRESHOLDS,
  METRIC_RANGES,
  DEFAULT_ENERGY_CONSUMPTION,
  SRI_LANKA_UTC_OFFSET_HOURS,
} from './constants'
export {
  generateApparentPowerSeries,
  generateTemperatureSeries,
  generateWaterTankSeries,
  generateFuelSeries,
  latestTelemetryValue,
  telemetryValueAt,
} from './telemetryGenerators'
export { generateTimestamps, getHistoricalTimestamps } from './timestamps'
export {
  resolveCurrentTelemetryIndex,
  resolveCurrentTelemetryTimestamp,
  msUntilNextTelemetryTick,
  getTelemetryRefreshIntervalMs,
} from './telemetryClock'
export {
  advanceLiveTelemetryIfDue,
  appendLiveTelemetryTick,
  isLiveTelemetrySimulatorActive,
  msUntilNextLiveSimulatorTick,
  pruneTelemetryWindow,
  resetLiveSimulatorClock,
} from './liveTelemetrySimulator'
export {
  buildCampsAtTelemetryIndex,
  buildAlarmsAtTelemetryIndex,
  resolveLiveCampsSnapshot,
  telemetryValueAtIndex,
} from './telemetrySnapshot'
export { deriveAlarmsFromCamps, getActiveAlarms, getTopAlarmSeverity, getCampAlarmSeverity } from './alarmDerivation'
export {
  calculateCampOperationalStatus,
  calculateSystemOperationalStatus,
  enrichCampsWithOperationalStatus,
  getOfflineCampIds,
} from './campOperationalStatus'
export { metricStatusForCamp, evaluateMetricStatus } from './statusDerivation'
