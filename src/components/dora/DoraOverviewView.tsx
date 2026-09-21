import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { Dora } from '@/types'
import { SectionHeader } from '@/components/ui'
import { SriLankaMap } from '@/components/map'
import { useCamps, useAlarms, useDoraEvaluations } from '@/hooks'
import { sortCampsByDisplayOrder } from '@/utils/homepage'
import { DoraAttentionRequired } from './DoraAttentionRequired'
import { DoraSystemOverview } from './DoraSystemOverview'
import { DoraTile } from './DoraTile'

export interface DoraOverviewViewProps {
  doras: Dora[]
}

export function DoraOverviewView({ doras }: DoraOverviewViewProps) {
  const group = useDoraEvaluations(doras)
  const campsState = useCamps()
  const alarmsState = useAlarms()
  const camps = sortCampsByDisplayOrder(campsState.data)
  const evaluationById = useMemo(
    () =>
      new Map(
        group.evaluations.map((evaluation) => [evaluation.doraId, evaluation]),
      ),
    [group.evaluations],
  )

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <DoraSystemOverview group={group} />
      <DoraAttentionRequired items={group.attentionItems} />

      <section aria-label="DORA operational map" className="animate-cw-fade-in">
        <div className="overflow-hidden rounded-cw-lg border border-cw-border-subtle bg-cw-surface shadow-cw-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cw-border-subtle px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated text-cw-text-muted">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold tracking-tight text-cw-text">
                  Operational Map
                </h2>
                <p className="mt-0.5 text-xs text-cw-text-muted">
                  Demo GPS — {doras.length} DORAs with camp sites
                </p>
              </div>
            </div>
          </div>
          <SriLankaMap
            camps={camps}
            alarms={alarmsState.data ?? []}
            doras={doras}
            className="h-[56vh] min-h-[380px] sm:min-h-[440px] lg:h-[62vh] lg:min-h-[480px]"
          />
        </div>
      </section>

      <section aria-label="DORA status" className="animate-cw-fade-in">
        <SectionHeader
          title="DORA Status"
          subtitle="Current operational condition of each monitored boat"
          className="mb-5"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {doras.map((dora) => {
            const evaluation = evaluationById.get(dora.id)
            if (!evaluation) return null
            return (
              <DoraTile key={dora.id} dora={dora} evaluation={evaluation} />
            )
          })}
        </div>
      </section>
    </div>
  )
}
