import { Marker, Popup } from 'react-leaflet'
import type { Alarm } from '@/types'
import type { Camp } from '@/types'
import { getActiveAlarms, getCampAlarmSeverity } from '@/utils/alarms'
import { createCampMarkerIcon } from './campMarkerIcon'
import { CampMapPopup } from './CampMapPopup'

export interface CampMarkerProps {
  camp: Camp
  alarms: Alarm[]
}

export function CampMarker({ camp, alarms }: CampMarkerProps) {
  const campAlarms = getActiveAlarms(alarms).filter((a) => a.campId === camp.id)
  const alarmSeverity = getCampAlarmSeverity(camp.id, alarms)
  const icon = createCampMarkerIcon(
    camp.name,
    camp.status,
    alarmSeverity,
    campAlarms.length,
  )

  return (
    <Marker
      position={[camp.latitude, camp.longitude]}
      icon={icon}
      zIndexOffset={
        camp.status === 'offline'
          ? 50
          : camp.status === 'critical'
            ? 400
            : camp.status === 'warning'
              ? 300
              : 100
      }
    >
      <Popup className="camp-popup-container" minWidth={260} maxWidth={320}>
        <CampMapPopup camp={camp} alarmCount={campAlarms.length} />
      </Popup>
    </Marker>
  )
}
