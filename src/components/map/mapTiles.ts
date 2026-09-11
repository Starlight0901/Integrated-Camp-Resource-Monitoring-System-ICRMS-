import type { Theme } from '@/theme'

/**
 * Provider-independent Leaflet tile layer options for one basemap style.
 * Swap URLs here — do not scatter tile endpoints through map UI components.
 */
export interface MapTileLayerConfig {
  /** Leaflet tile URL template (`{z}/{x}/{y}` or provider-specific order). */
  url: string
  attribution: string
  maxZoom?: number
  maxNativeZoom?: number
  minZoom?: number
  opacity?: number
  subdomains?: string | string[]
}

/** One or more layers for a single application theme (base first). */
export interface MapThemeTileConfig {
  layers: MapTileLayerConfig[]
}

/**
 * Named presets — reusable building blocks for ACTIVE_MAP_TILE_PROVIDER.
 * Public tile endpoints are not a long-term availability guarantee; keep
 * camp data, markers, and map UI independent of these URLs.
 */
export const OSM_STANDARD_RASTER: MapTileLayerConfig = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
}

/** Subdued dark grey basemap (Esri Canvas). Uses Esri tile order `{z}/{y}/{x}`. */
export const ESRI_WORLD_DARK_GRAY_BASE: MapTileLayerConfig = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
  maxNativeZoom: 16,
  maxZoom: 16,
}

/** Place labels / boundaries overlay for the Esri dark grey canvas. */
export const ESRI_WORLD_DARK_GRAY_REFERENCE: MapTileLayerConfig = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  // Attribution is carried by the base layer to avoid duplicate credit text.
  attribution: '',
  maxNativeZoom: 16,
  maxZoom: 16,
  opacity: 0.9,
}

/**
 * Active tile provider set consumed by the map.
 * To replace a provider later, change only this object (or the presets it references).
 */
export const ACTIVE_MAP_TILE_PROVIDER: Record<Theme, MapThemeTileConfig> = {
  light: {
    layers: [OSM_STANDARD_RASTER],
  },
  dark: {
    layers: [ESRI_WORLD_DARK_GRAY_BASE, ESRI_WORLD_DARK_GRAY_REFERENCE],
  },
}

export function getMapTilesForTheme(theme: Theme): MapThemeTileConfig {
  return ACTIVE_MAP_TILE_PROVIDER[theme]
}
