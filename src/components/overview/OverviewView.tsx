import type { Alarm, Camp } from '@/types'
import type { AsyncState } from '@/services'
import { MapPin } from 'lucide-react'
import { SriLankaMap } from '@/components/map'
import { CampLocationCard } from '@/components/homepage'
import {
  ActionButton,
  ErrorState,
  NoDataState,
  OverviewPageSkeleton,
  SectionHeader,
} from '@/components/ui'
import { sortCampsByDisplayOrder } from '@/utils/homepage'

export interface OverviewViewProps {
  campsState: AsyncState<Camp[]>
  alarmsState: AsyncState<Alarm[]>
}

export function OverviewView({ campsState, alarmsState }: OverviewViewProps) {
  const { data: camps, loading, error } = campsState
  const sortedCamps = sortCampsByDisplayOrder(camps)

  if (loading) {
    return <OverviewPageSkeleton />
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <ErrorState
          title="Unable to load camp data"
          description={error.message}
          action={
            <ActionButton onClick={() => window.location.reload()}>Retry</ActionButton>
          }
        />
      </div>
    )
  }

  return (
    <>
      {sortedCamps.length === 0 ? (
        <NoDataState
          title="No camps configured"
          description="Camp sites will appear here once telemetry sources are connected."
        />
      ) : (
        <div className="flex flex-col gap-8 lg:gap-10">
          <section aria-label="Sri Lanka camp map" className="animate-cw-fade-in">
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
                      Sri Lanka — {sortedCamps.length} monitored sites
                    </p>
                  </div>
                </div>
              </div>

              <SriLankaMap
                camps={sortedCamps}
                alarms={alarmsState.data}
                className="h-[56vh] min-h-[380px] sm:min-h-[440px] lg:h-[68vh] lg:min-h-[540px] xl:min-h-[580px]"
              />
            </div>
          </section>

          <section aria-label="Camp locations" className="animate-cw-fade-in">
            <SectionHeader
              title="Camp Locations"
              subtitle="Select a site for detailed telemetry and alarm history"
              className="mb-5"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedCamps.map((camp) => (
                <CampLocationCard key={camp.id} camp={camp} />
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
