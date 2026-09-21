import { MapContainer } from 'react-leaflet'
import type { Alarm, Camp, Dora } from '@/types'
import { getActiveAlarms } from '@/utils/alarms'
import { cn } from '@/utils'
import { useTheme } from '@/theme'
import { CampMarker } from './CampMarker'
import { DoraMarker } from './DoraMarker'
import { MapBasemapLayer } from './MapBasemapLayer'
import { MapCampBounds } from './MapCampBounds'
import { MapLegend } from './MapLegend'
import {
  SRI_LANKA_BOUNDS,
  SRI_LANKA_MAX_ZOOM,
  SRI_LANKA_MIN_ZOOM,
} from './mapConfig'
import {
  SRI_LANKA_FALLBACK_CENTER,
  SRI_LANKA_FALLBACK_ZOOM,
} from './mapBounds'
import '@/components/map/map.css'

export interface SriLankaMapProps {
  camps: Camp[]
  alarms: Alarm[]
  doras?: Dora[]
  className?: string
}

export function SriLankaMap({
  camps,
  alarms,
  doras = [],
  className,
}: SriLankaMapProps) {
  const { theme } = useTheme()
  const activeAlarmCount = getActiveAlarms(alarms).length

  return (
    <div className={cn('relative h-full w-full', className)}>
      <MapContainer
        center={SRI_LANKA_FALLBACK_CENTER}
        zoom={SRI_LANKA_FALLBACK_ZOOM}
        minZoom={SRI_LANKA_MIN_ZOOM}
        maxZoom={SRI_LANKA_MAX_ZOOM}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom
        className="cw-map h-full w-full"
      >
        <MapBasemapLayer theme={theme} />
        <MapCampBounds camps={camps} />
        {camps.map((camp) => (
          <CampMarker key={camp.id} camp={camp} alarms={alarms} />
        ))}
        {doras.map((dora) => (
          <DoraMarker key={`${dora.id}-${dora.status}`} dora={dora} />
        ))}
      </MapContainer>

      <MapLegend
        campCount={camps.length}
        doraCount={doras.length}
        activeAlarmCount={activeAlarmCount}
      />
    </div>
  )
}
