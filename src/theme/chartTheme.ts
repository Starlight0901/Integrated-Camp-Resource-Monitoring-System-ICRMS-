import type { MetricKey } from '@/types'
import { useTheme } from './ThemeProvider'

/** Telemetry trend line hues — never alarm red. */
export type TelemetryChartSeries = 'blue' | 'green' | 'teal'

/** Metric → telemetry series color mapping (consistent across all charts). */
export const METRIC_TELEMETRY_SERIES: Record<MetricKey, TelemetryChartSeries> = {
  apparentPower: 'blue',
  temperature: 'teal',
  waterLevel: 'blue',
  fuelLevel: 'green',
}

export interface ChartTheme {
  background: string
  grid: string
  axis: string
  axisLabel: string
  tooltipBackground: string
  tooltipBorder: string
  tooltipLabel: string
  tooltipValue: string
  tooltipShadow: string
  activeDotStroke: string
  cursor: string
  telemetryBlue: string
  telemetryGreen: string
  telemetryTeal: string
  telemetryBlueFill: string
  telemetryGreenFill: string
  telemetryTealFill: string
  warningAmber: string
  criticalRed: string
}

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

export function getChartTheme(): ChartTheme {
  return {
    background: readCssVar('--cw-chart-bg', '#ffffff'),
    grid: readCssVar('--cw-chart-grid', 'rgb(20 36 58 / 0.05)'),
    axis: readCssVar('--cw-chart-axis', '#e6eef5'),
    axisLabel: readCssVar('--cw-chart-axis-label', '#7a8fa3'),
    tooltipBackground: readCssVar('--cw-chart-tooltip-bg', '#ffffff'),
    tooltipBorder: readCssVar('--cw-chart-tooltip-border', '#d5e0eb'),
    tooltipLabel: readCssVar('--cw-chart-tooltip-label', '#7a8fa3'),
    tooltipValue: readCssVar('--cw-chart-tooltip-value', '#14243a'),
    tooltipShadow: readCssVar(
      '--cw-chart-tooltip-shadow',
      '0 8px 24px rgb(20 36 58 / 0.1)',
    ),
    activeDotStroke: readCssVar('--cw-chart-active-dot-stroke', '#ffffff'),
    cursor: readCssVar('--cw-chart-cursor', 'rgb(37 99 235 / 0.16)'),
    telemetryBlue: readCssVar('--cw-telemetry-blue', '#3b6ea8'),
    telemetryGreen: readCssVar('--cw-telemetry-green', '#3d8b5f'),
    telemetryTeal: readCssVar('--cw-telemetry-teal', '#2a8f88'),
    telemetryBlueFill: readCssVar(
      '--cw-telemetry-blue-fill',
      'rgb(59 110 168 / 0.12)',
    ),
    telemetryGreenFill: readCssVar(
      '--cw-telemetry-green-fill',
      'rgb(61 139 95 / 0.1)',
    ),
    telemetryTealFill: readCssVar(
      '--cw-telemetry-teal-fill',
      'rgb(42 143 136 / 0.12)',
    ),
    warningAmber: readCssVar('--cw-status-warning', '#b45309'),
    criticalRed: readCssVar('--cw-status-critical', '#dc2626'),
  }
}

export function getTelemetrySeriesColor(
  series: TelemetryChartSeries,
  theme: ChartTheme = getChartTheme(),
): string {
  if (series === 'teal') return theme.telemetryTeal
  if (series === 'green') return theme.telemetryGreen
  return theme.telemetryBlue
}

export function getTelemetrySeriesFill(
  series: TelemetryChartSeries,
  theme: ChartTheme = getChartTheme(),
): string {
  if (series === 'teal') return theme.telemetryTealFill
  if (series === 'green') return theme.telemetryGreenFill
  return theme.telemetryBlueFill
}

export function getMetricTelemetrySeries(metricKey: MetricKey): TelemetryChartSeries {
  return METRIC_TELEMETRY_SERIES[metricKey]
}

export function getMetricTelemetryColor(
  metricKey: MetricKey,
  theme?: ChartTheme,
): string {
  return getTelemetrySeriesColor(getMetricTelemetrySeries(metricKey), theme)
}

export function useChartTheme(): ChartTheme {
  useTheme()
  return getChartTheme()
}
