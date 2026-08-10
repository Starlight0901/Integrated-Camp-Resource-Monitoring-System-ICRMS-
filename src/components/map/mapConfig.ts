import type { LatLngBoundsExpression } from 'leaflet'

/** Pan limits for Sri Lanka — prevents drifting far off the island. */
export const SRI_LANKA_BOUNDS: LatLngBoundsExpression = [
  [5.85, 79.5],
  [10.05, 82.1],
]

export const SRI_LANKA_MIN_ZOOM = 7

export const SRI_LANKA_MAX_ZOOM = 12

export const DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export const LIGHT_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
