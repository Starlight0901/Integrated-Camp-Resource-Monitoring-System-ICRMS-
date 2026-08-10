import { MapContainer, TileLayer } from 'react-leaflet'
import type { Alarm, Camp } from '@/types'
import { getActiveAlarms } from '@/utils/alarms'
import { cn } from '@/utils'
import { useTheme } from '@/theme'
import { CampMarker } from './CampMarker'
import { MapCampBounds } from './MapCampBounds'
import { MapLegend } from './MapLegend'
import {
  DARK_TILE_URL,
  LIGHT_TILE_URL,
  SRI_LANKA_BOUNDS,
  SRI_LANKA_MAX_ZOOM,
  SRI_LANKA_MIN_ZOOM,
  TILE_ATTRIBUTION,
} from './mapConfig'
import {
  SRI_LANKA_FALLBACK_CENTER,
  SRI_LANKA_FALLBACK_ZOOM,
} from './mapBounds'
import '@/components/map/map.css'

export interface SriLankaMapProps {
  camps: Camp[]
  alarms: Alarm[]
  className?: string
}

export function SriLankaMap({ camps, alarms, className }: SriLankaMapProps) {
  const { theme } = useTheme()
  const activeAlarmCount = getActiveAlarms(alarms).length
  const tileUrl = theme === 'dark' ? DARK_TILE_URL : LIGHT_TILE_URL

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
        <TileLayer key={theme} url={tileUrl} attribution={TILE_ATTRIBUTION} />
        <MapCampBounds camps={camps} />
        {camps.map((camp) => (
          <CampMarker key={camp.id} camp={camp} alarms={alarms} />
        ))}
      </MapContainer>

      <MapLegend campCount={camps.length} activeAlarmCount={activeAlarmCount} />
    </div>
  )
}
