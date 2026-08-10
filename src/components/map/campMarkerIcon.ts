import { divIcon, type DivIcon } from 'leaflet'
import type { CampStatus } from '@/types'
import { CAMP_STATUS_LABELS, shortCampLabel } from '@/utils'

const STATUS_CLASS: Record<CampStatus, string> = {
  online: 'camp-marker__dot--online',
  warning: 'camp-marker__dot--warning',
  critical: 'camp-marker__dot--critical',
  offline: 'camp-marker__dot--offline',
}

const STATUS_STRIPE: Record<CampStatus, string> = {
  online: 'camp-marker__label--online',
  warning: 'camp-marker__label--warning',
  critical: 'camp-marker__label--critical',
  offline: 'camp-marker__label--offline',
}

/**
 * Fixed icon dimensions — must match rendered marker layout in map.css.
 * iconAnchor is the geographic point: horizontal center of the status dot.
 */
const MARKER_WIDTH = 120
const MARKER_HEIGHT = 68
const DOT_SIZE = 13
const MARKER_ANCHOR_X = MARKER_WIDTH / 2
const MARKER_ANCHOR_Y = DOT_SIZE / 2

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** @deprecated Use shortCampLabel from @/utils */
export function shortCampMapLabel(name: string): string {
  return shortCampLabel(name)
}

export function createCampMarkerIcon(
  name: string,
  status: CampStatus,
  alarmSeverity: 'warning' | 'critical' | null,
  activeAlarmCount: number,
): DivIcon {
  const statusClass = STATUS_CLASS[status]
  const stripeClass = STATUS_STRIPE[status]
  const statusLabel = CAMP_STATUS_LABELS[status]
  const displayName = shortCampLabel(name)
  const hasAlarm = alarmSeverity !== null
  const alarmClass = hasAlarm ? ' camp-marker--alarm' : ''
  const ringClass =
    alarmSeverity === 'critical'
      ? 'camp-marker__ring camp-marker__ring--critical'
      : 'camp-marker__ring camp-marker__ring--warning'

  return divIcon({
    className: 'camp-marker-wrapper',
    html: `
      <div class="camp-marker${alarmClass}" role="img" aria-label="${escapeHtml(displayName)} — ${statusLabel}">
        <div class="camp-marker__pin">
          ${hasAlarm ? `<span class="${ringClass}"></span>` : ''}
          ${hasAlarm ? `<span class="camp-marker__alarm-badge">${activeAlarmCount}</span>` : ''}
          <span class="camp-marker__dot ${statusClass}"></span>
          <span class="camp-marker__stem"></span>
        </div>
        <div class="camp-marker__label ${stripeClass}">
          <span class="camp-marker__name">${escapeHtml(displayName)}</span>
          <span class="camp-marker__status">${statusLabel}</span>
        </div>
      </div>
    `,
    iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
    iconAnchor: [MARKER_ANCHOR_X, MARKER_ANCHOR_Y],
    popupAnchor: [0, -MARKER_ANCHOR_Y],
  })
}
