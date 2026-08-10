import type { Camp } from '@/types'
import { Card } from '@/components/ui'
import { MapPin } from 'lucide-react'

const PLACEHOLDER_IMAGE = '/images/camps/placeholder.svg'

export interface CampOverviewPanelProps {
  camp: Camp
}

/** Compact camp image / site overview — supporting context, not the primary focus. */
export function CampOverviewPanel({ camp }: CampOverviewPanelProps) {
  return (
    <Card padding="none" variant="default" className="overflow-hidden">
      <div className="relative h-36 w-full bg-cw-bg-elevated sm:h-40">
        <img
          src={camp.image}
          alt={`${camp.name} site overview`}
          className="h-full w-full object-cover opacity-90"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cw-bg/70 via-transparent to-transparent" />
        <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-cw-text-dim">
            Site overview
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-cw-text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-cw-text-dim" strokeWidth={1.75} />
            {camp.latitude.toFixed(4)}°N, {camp.longitude.toFixed(4)}°E
          </p>
        </div>
      </div>
    </Card>
  )
}
