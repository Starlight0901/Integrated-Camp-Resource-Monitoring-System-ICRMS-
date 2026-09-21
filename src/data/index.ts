export {
  APP_ACRONYM,
  APP_DOCUMENT_TITLE,
  APP_NAME,
  APP_NAME_OFFICIAL,
} from './branding'
export { dummyCamps, dummyTelemetry, dummyAlarms, getLiveTelemetrySnapshot, telemetryTimestamps } from './generateDataset'
export { dummyDoras } from './doraDemoData'
export {
  DORA_DEMO_SEEDS,
  DORA_FUEL_UNIT,
  DORA_HISTORY_DAYS,
  DORA_HISTORY_INTERVAL_MS,
  DORA_HISTORY_POINT_COUNT,
  DORA_HISTORY_POINTS_PER_DAY,
  DORA_LIVE_MAX_DELTA,
  DORA_LIVE_SIMULATOR_INTERVAL_MS,
  DORA_LIVE_TELEMETRY_SIMULATOR,
  DORA_POWER_UNIT,
  DORA_RESOURCE_DEFINITIONS,
  DORA_RESOURCE_ORDER,
  DORA_RESOURCE_RANGES,
  DORA_STATUS_THRESHOLDS,
} from './doraConstants'
export { getDoraHistoricalTimestamps } from './doraTimestamps'
export type { DoraTelemetrySeries } from './doraTimestamps'
export {
  getDoraHistoricalRecord,
  getDoraHistoricalSeries,
  appendDoraLiveReadings,
  getDoraHistoryLatestTimestamp,
} from './doraHistoricalTelemetry'
export {
  subscribeDoraLive,
  getLiveDoras,
  getLiveDora,
  advanceDoraLiveIfDue,
  msUntilNextDoraLiveTick,
  isDoraLiveSimulatorActive,
  resetDoraLiveSimulator,
} from './doraLiveSimulator'
export {
  clampDoraReadings,
  deriveDoraStatus,
  doraStatusRank,
  worseDoraStatus,
} from './doraStatusDerivation'
export {
  evaluateDoraFuelLevel,
  evaluateDoraPowerConsumption,
  evaluateDoraResourceThreshold,
} from './doraThresholds'
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
export { deriveAlarmsFromDoras } from './doraAlarmDerivation'
export {
  calculateCampOperationalStatus,
  calculateSystemOperationalStatus,
  enrichCampsWithOperationalStatus,
  getOfflineCampIds,
} from './campOperationalStatus'
export { metricStatusForCamp, evaluateMetricStatus } from './statusDerivation'
