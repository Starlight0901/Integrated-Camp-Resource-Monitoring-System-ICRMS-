import type { Dora } from '@/types'
import { ActionLink, NoDataState, SectionHeader } from '@/components/ui'
import { getDoraHistoricalRecord } from '@/data'
import { evaluateDora } from '@/monitoring'
import { DoraCurrentReadings } from './DoraCurrentReadings'
import { DoraDashboardHeader } from './DoraDashboardHeader'
import { DoraTelemetryChart } from './DoraTelemetryChart'

export interface DoraDashboardViewProps {
  dora: Dora | null
}

export function DoraDashboardView({ dora }: DoraDashboardViewProps) {
  if (!dora) {
    return (
      <div className="mx-auto max-w-lg">
        <NoDataState
          title="DORA not found"
          description="The requested DORA does not exist in the demo monitoring set."
          action={<ActionLink to="/doras">Back to DORA overview</ActionLink>}
        />
      </div>
    )
  }

  const evaluation = evaluateDora(dora)
  const history = getDoraHistoricalRecord(dora.id)
  const fuelResource = evaluation.resources.find(
    (resource) => resource.resource === 'fuelLevel',
  )
  const powerResource = evaluation.resources.find(
    (resource) => resource.resource === 'powerConsumption',
  )

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <DoraDashboardHeader dora={dora} />
      <DoraCurrentReadings dora={dora} />

      <section aria-label="Historical telemetry" className="space-y-5">
        <SectionHeader
          title="Historical Telemetry"
          subtitle="Rolling 7-day fuel and power trends"
        />
        {history && fuelResource && powerResource ? (
          <div className="grid gap-6">
            <DoraTelemetryChart
              resource="fuelLevel"
              points={history.fuel.points}
              currentValue={dora.fuelLevel}
              currentStatus={fuelResource.status}
            />
            <DoraTelemetryChart
              resource="powerConsumption"
              points={history.power.points}
              currentValue={dora.powerConsumption}
              currentStatus={powerResource.status}
            />
          </div>
        ) : (
          <NoDataState
            title="Historical telemetry unavailable"
            description="No 7-day history is available for this DORA."
          />
        )}
      </section>
    </div>
  )
}
