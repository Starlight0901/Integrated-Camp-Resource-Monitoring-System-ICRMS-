import type { Camp } from '@/types'
import { latLngBounds, type LatLngBoundsExpression } from 'leaflet'

/** Geographic bounds enclosing all camp coordinates with padding. */
export function getCampBounds(camps: Camp[]): LatLngBoundsExpression | null {
  if (camps.length === 0) return null

  return latLngBounds(
    camps.map((camp) => [camp.latitude, camp.longitude] as [number, number]),
  )
}

/** Default map padding when fitting camp bounds (pixels). */
export const MAP_FIT_BOUNDS_PADDING: [number, number] = [48, 48]

/** Maximum zoom when auto-fitting camp bounds. */
export const MAP_FIT_MAX_ZOOM = 9

/** Fallback center when no camps are available yet. */
export const SRI_LANKA_FALLBACK_CENTER: [number, number] = [7.75, 80.75]

/** Fallback zoom when bounds cannot be calculated. */
export const SRI_LANKA_FALLBACK_ZOOM = 7.4
