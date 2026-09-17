import type { Alarm, Camp, MetricKey } from '@/types'
import type { AsyncState } from '@/services'
import { CampTelemetryHistoryModal } from '@/components/telemetry'
import {
  ActionButton,
  ActionLink,
  CampDashboardSkeleton,
  ErrorState,
  NoDataState,
  OfflineState,
} from '@/components/ui'
import { CampDashboardHeader } from './CampDashboardHeader'
import { CampOverviewPanel } from './CampOverviewPanel'
import { CampMetricsPanel } from './CampMetricsPanel'
import { CampAlarmsSection } from './CampAlarmsSection'
import { useCampTrendObservations } from '@/hooks'

export interface CampDashboardViewProps {
  campState: AsyncState<Camp | null>
  alarmsState: AsyncState<Alarm[]>
  selectedMetric: MetricKey | null
  highlightedMetric?: MetricKey | null
  onMetricSelect: (metricKey: MetricKey) => void
  onMetricClose: () => void
}

export function CampDashboardView({
  campState,
  alarmsState,
  selectedMetric,
  highlightedMetric = null,
  onMetricSelect,
  onMetricClose,
}: CampDashboardViewProps) {
  const { data: camp, loading, error } = campState
  const isOffline = camp?.status === 'offline'
  const trends = useCampTrendObservations(isOffline ? null : camp)

  if (loading) {
    return <CampDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState
          title="Unable to load camp telemetry"
          description={error.message}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ActionButton onClick={() => window.location.reload()}>Retry</ActionButton>
              <ActionLink to="/">Back to overview</ActionLink>
            </div>
          }
        />
      </div>
    )
  }

  if (!camp) {
    return (
      <div className="mx-auto max-w-lg">
        <NoDataState
          title="Camp not found"
          description="The requested camp site does not exist or is unavailable."
          action={<ActionLink to="/">Back to overview</ActionLink>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <CampDashboardHeader camp={camp} />

      <CampOverviewPanel camp={camp} />

      {isOffline ? (
        <OfflineState />
      ) : (
        <>
          <CampMetricsPanel
            camp={camp}
            onMetricClick={onMetricSelect}
            highlightedMetric={highlightedMetric}
            trends={trends}
          />

          <CampAlarmsSection
            campId={camp.id}
            alarms={alarmsState.data ?? []}
            onAlarmClick={onMetricSelect}
          />
        </>
      )}

      {!isOffline && (
        <CampTelemetryHistoryModal
          camp={camp}
          metricKey={selectedMetric}
          onClose={onMetricClose}
        />
      )}
    </div>
  )
}
