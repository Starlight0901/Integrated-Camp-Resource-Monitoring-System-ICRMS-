import { Marker, Popup } from 'react-leaflet'
import type { Dora } from '@/types'
import { evaluateDora } from '@/monitoring'
import { createDoraMarkerIcon } from './doraMarkerIcon'
import { DoraMapPopup } from './DoraMapPopup'

export interface DoraMarkerProps {
  dora: Dora
}

export function DoraMarker({ dora }: DoraMarkerProps) {
  const evaluation = evaluateDora(dora)
  const icon = createDoraMarkerIcon(dora.name, evaluation.status)

  return (
    <Marker
      position={[dora.location.latitude, dora.location.longitude]}
      icon={icon}
      zIndexOffset={
        evaluation.status === 'critical'
          ? 390
          : evaluation.status === 'warning'
            ? 290
            : 90
      }
    >
      <Popup className="camp-popup-container" minWidth={260} maxWidth={320}>
        <DoraMapPopup dora={dora} />
      </Popup>
    </Marker>
  )
}
