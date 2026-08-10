import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { Camp } from '@/types'
import {
  getCampBounds,
  MAP_FIT_BOUNDS_PADDING,
  MAP_FIT_MAX_ZOOM,
} from './mapBounds'

export interface MapCampBoundsProps {
  camps: Camp[]
}

/**
 * Fits the map viewport to the geographic bounds of all camp coordinates once on load.
 * Uses WGS84 lat/lng from camp data — no screen-space positioning.
 */
export function MapCampBounds({ camps }: MapCampBoundsProps) {
  const map = useMap()
  const hasFitted = useRef(false)

  useEffect(() => {
    if (hasFitted.current || camps.length === 0) return

    const bounds = getCampBounds(camps)
    if (!bounds) return

    hasFitted.current = true
    map.fitBounds(bounds, {
      padding: MAP_FIT_BOUNDS_PADDING,
      maxZoom: MAP_FIT_MAX_ZOOM,
    })
  }, [map, camps])

  return null
}
