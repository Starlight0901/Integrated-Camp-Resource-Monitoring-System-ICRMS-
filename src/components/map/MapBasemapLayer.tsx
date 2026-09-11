import { TileLayer } from 'react-leaflet'
import type { Theme } from '@/theme'
import {
  getMapTilesForTheme,
  type MapTileLayerConfig,
} from './mapTiles'

export interface MapBasemapLayerProps {
  theme: Theme
}

/**
 * Build TileLayer props from config, omitting unset options.
 * Passing `subdomains={undefined}` overrides Leaflet's default and crashes
 * in `_getSubdomain` when it reads `.length`.
 */
function toTileLayerProps(layer: MapTileLayerConfig) {
  return {
    url: layer.url,
    attribution: layer.attribution,
    ...(layer.maxZoom !== undefined ? { maxZoom: layer.maxZoom } : {}),
    ...(layer.maxNativeZoom !== undefined
      ? { maxNativeZoom: layer.maxNativeZoom }
      : {}),
    ...(layer.minZoom !== undefined ? { minZoom: layer.minZoom } : {}),
    ...(layer.opacity !== undefined ? { opacity: layer.opacity } : {}),
    ...(layer.subdomains !== undefined ? { subdomains: layer.subdomains } : {}),
  }
}

/**
 * Renders the active theme's basemap tile layer(s) from map tile configuration.
 * Remounts on theme change so Leaflet swaps tiles without a page reload.
 */
export function MapBasemapLayer({ theme }: MapBasemapLayerProps) {
  const { layers } = getMapTilesForTheme(theme)

  return (
    <>
      {layers.map((layer, index) => (
        <TileLayer
          key={`${theme}-${index}-${layer.url}`}
          {...toTileLayerProps(layer)}
        />
      ))}
    </>
  )
}
