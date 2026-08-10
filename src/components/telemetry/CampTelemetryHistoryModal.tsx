import type { Camp, MetricKey } from '@/types'
import { useCampTelemetry } from '@/hooks'
import { METRIC_DISPLAY_CONFIG } from '@/utils/metricConfig'
import { TelemetryHistoryModal } from './TelemetryHistoryModal'

export interface CampTelemetryHistoryModalProps {
  camp: Camp
  metricKey: MetricKey | null
  onClose: () => void
}

export function CampTelemetryHistoryModal({
  camp,
  metricKey,
  onClose,
}: CampTelemetryHistoryModalProps) {
  if (!metricKey) return null

  return (
    <CampTelemetryHistoryModalContent
      camp={camp}
      metricKey={metricKey}
      onClose={onClose}
    />
  )
}

function CampTelemetryHistoryModalContent({
  camp,
  metricKey,
  onClose,
}: {
  camp: Camp
  metricKey: MetricKey
  onClose: () => void
}) {
  const telemetryState = useCampTelemetry(camp.id, metricKey)
  const metric = camp.metrics[metricKey]
  const config = METRIC_DISPLAY_CONFIG[metricKey]

  return (
    <TelemetryHistoryModal
      open
      onClose={onClose}
      camp={camp}
      metric={metric}
      historicalData={telemetryState.data.points}
      currentValue={telemetryState.data.currentValue}
      unit={config.unit}
      min={config.min}
      max={config.max}
      loading={telemetryState.loading}
      error={telemetryState.error?.message ?? null}
    />
  )
}
