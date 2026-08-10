import type { MetricKey } from '@/types'
import { useTheme } from './ThemeProvider'

/** Blue or green — the only telemetry trend line hues (never alarm red). */
export type TelemetryChartSeries = 'blue' | 'green'

/** Metric → telemetry series color mapping (consistent across all charts). */
export const METRIC_TELEMETRY_SERIES: Record<MetricKey, TelemetryChartSeries> = {
  apparentPower: 'blue',
  temperature: 'green',
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
  telemetryBlueFill: string
  telemetryGreenFill: string
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
    grid: readCssVar('--cw-chart-grid', 'rgb(0 0 0 / 0.04)'),
    axis: readCssVar('--cw-chart-axis', '#e8e8ea'),
    axisLabel: readCssVar('--cw-chart-axis-label', '#8a8a8a'),
    tooltipBackground: readCssVar('--cw-chart-tooltip-bg', '#ffffff'),
    tooltipBorder: readCssVar('--cw-chart-tooltip-border', '#e0e0e2'),
    tooltipLabel: readCssVar('--cw-chart-tooltip-label', '#8a8a8a'),
    tooltipValue: readCssVar('--cw-chart-tooltip-value', '#1a1a1a'),
    tooltipShadow: readCssVar(
      '--cw-chart-tooltip-shadow',
      '0 2px 8px rgb(0 0 0 / 0.08)',
    ),
    activeDotStroke: readCssVar('--cw-chart-active-dot-stroke', '#ffffff'),
    cursor: readCssVar('--cw-chart-cursor', 'rgb(74 122 184 / 0.15)'),
    telemetryBlue: readCssVar('--cw-telemetry-blue', '#4a7ab8'),
    telemetryGreen: readCssVar('--cw-telemetry-green', '#3d8b5f'),
    telemetryBlueFill: readCssVar(
      '--cw-telemetry-blue-fill',
      'rgb(74 122 184 / 0.1)',
    ),
    telemetryGreenFill: readCssVar(
      '--cw-telemetry-green-fill',
      'rgb(61 139 95 / 0.1)',
    ),
    warningAmber: readCssVar('--cw-status-warning', '#b45309'),
    criticalRed: readCssVar('--cw-status-critical', '#c8102e'),
  }
}

export function getTelemetrySeriesColor(
  series: TelemetryChartSeries,
  theme: ChartTheme = getChartTheme(),
): string {
  return series === 'blue' ? theme.telemetryBlue : theme.telemetryGreen
}

export function getTelemetrySeriesFill(
  series: TelemetryChartSeries,
  theme: ChartTheme = getChartTheme(),
): string {
  return series === 'blue' ? theme.telemetryBlueFill : theme.telemetryGreenFill
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
