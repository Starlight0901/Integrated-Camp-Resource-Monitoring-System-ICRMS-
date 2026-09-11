import { Zap, Droplets, Fuel, Thermometer, type LucideIcon } from 'lucide-react'
import type { MetricKey } from '@/types'
import { METRIC_DEFINITIONS } from '@/types'
import { METRIC_RANGES } from '@/data/constants'
import {
  getMetricTelemetryColor,
  METRIC_TELEMETRY_SERIES,
  type TelemetryChartSeries,
} from '@/theme/chartTheme'

export type { TelemetryChartSeries }
export { METRIC_TELEMETRY_SERIES }

export interface MetricDisplayConfig {
  icon: LucideIcon
  label: string
  unit: string
  min: number
  max: number
  showCapacity: boolean
  /** Telemetry chart series — resolved to blue/green/teal via theme tokens */
  chartSeries: TelemetryChartSeries
}

export const METRIC_DISPLAY_CONFIG: Record<MetricKey, MetricDisplayConfig> = {
  apparentPower: {
    icon: Zap,
    label: METRIC_DEFINITIONS.apparentPower.label,
    unit: METRIC_DEFINITIONS.apparentPower.unit,
    min: METRIC_RANGES.apparentPower.min,
    max: METRIC_RANGES.apparentPower.max,
    showCapacity: false,
    chartSeries: METRIC_TELEMETRY_SERIES.apparentPower,
  },
  temperature: {
    icon: Thermometer,
    label: METRIC_DEFINITIONS.temperature.label,
    unit: METRIC_DEFINITIONS.temperature.unit,
    min: METRIC_RANGES.temperature.min,
    max: METRIC_RANGES.temperature.max,
    showCapacity: false,
    chartSeries: METRIC_TELEMETRY_SERIES.temperature,
  },
  waterLevel: {
    icon: Droplets,
    label: METRIC_DEFINITIONS.waterLevel.label,
    unit: METRIC_DEFINITIONS.waterLevel.unit,
    min: METRIC_RANGES.waterLevel.min,
    max: METRIC_RANGES.waterLevel.max,
    showCapacity: true,
    chartSeries: METRIC_TELEMETRY_SERIES.waterLevel,
  },
  fuelLevel: {
    icon: Fuel,
    label: METRIC_DEFINITIONS.fuelLevel.label,
    unit: METRIC_DEFINITIONS.fuelLevel.unit,
    min: METRIC_RANGES.fuelLevel.min,
    max: METRIC_RANGES.fuelLevel.max,
    showCapacity: true,
    chartSeries: METRIC_TELEMETRY_SERIES.fuelLevel,
  },
}

/** @deprecated Use getMetricTelemetryColor(metricKey) from @/theme for theme-aware colors */
export function getMetricChartColor(metricKey: MetricKey): string {
  return getMetricTelemetryColor(metricKey)
}

export const METRIC_CARD_ORDER: MetricKey[] = [
  'apparentPower',
  'temperature',
  'waterLevel',
  'fuelLevel',
]

/** KPI chrome only — status colors still override when warning/critical. */
export const METRIC_ACCENT_CLASS: Record<
  MetricKey,
  { wrap: string; bar: string }
> = {
  apparentPower: {
    wrap: 'border-transparent bg-cw-metric-power-bg text-cw-metric-power',
    bar: 'bg-cw-metric-power',
  },
  temperature: {
    wrap: 'border-transparent bg-cw-metric-temp-bg text-cw-metric-temp',
    bar: 'bg-cw-metric-temp',
  },
  waterLevel: {
    wrap: 'border-transparent bg-cw-metric-water-bg text-cw-metric-water',
    bar: 'bg-cw-metric-water',
  },
  fuelLevel: {
    wrap: 'border-transparent bg-cw-metric-fuel-bg text-cw-metric-fuel',
    bar: 'bg-cw-metric-fuel',
  },
}

export function metricCapacityPercent(key: MetricKey, value: number): number {
  const config = METRIC_DISPLAY_CONFIG[key]
  if (!config.showCapacity) return 0
  return Math.round(
    ((value - config.min) / (config.max - config.min)) * 100,
  )
}

export function metricRangePercent(key: MetricKey, value: number): number {
  const config = METRIC_DISPLAY_CONFIG[key]
  return Math.min(
    100,
    Math.max(0, ((value - config.min) / (config.max - config.min)) * 100),
  )
}
