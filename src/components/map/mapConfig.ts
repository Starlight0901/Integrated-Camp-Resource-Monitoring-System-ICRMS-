import type { LatLngBoundsExpression } from 'leaflet'

/** Pan limits for Sri Lanka — prevents drifting far off the island. */
export const SRI_LANKA_BOUNDS: LatLngBoundsExpression = [
  [5.85, 79.5],
  [10.05, 82.1],
]

export const SRI_LANKA_MIN_ZOOM = 7

export const SRI_LANKA_MAX_ZOOM = 12
