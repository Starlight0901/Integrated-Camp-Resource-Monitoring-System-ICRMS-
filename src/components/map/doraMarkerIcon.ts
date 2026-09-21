import { divIcon, type DivIcon } from 'leaflet'
import type { DoraStatus } from '@/types'
import { DORA_STATUS_LABELS } from '@/types'

const STATUS_CLASS: Record<DoraStatus, string> = {
  normal: 'dora-marker__diamond--normal',
  warning: 'dora-marker__diamond--warning',
  critical: 'dora-marker__diamond--critical',
}

const STATUS_STRIPE: Record<DoraStatus, string> = {
  normal: 'dora-marker__label--normal',
  warning: 'dora-marker__label--warning',
  critical: 'dora-marker__label--critical',
}

const MARKER_WIDTH = 108
const MARKER_HEIGHT = 62
const DIAMOND_SIZE = 11
const MARKER_ANCHOR_X = MARKER_WIDTH / 2
const MARKER_ANCHOR_Y = DIAMOND_SIZE / 2 + 4

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function createDoraMarkerIcon(name: string, status: DoraStatus): DivIcon {
  const statusClass = STATUS_CLASS[status]
  const stripeClass = STATUS_STRIPE[status]
  const statusLabel = DORA_STATUS_LABELS[status]

  return divIcon({
    className: 'dora-marker-wrapper',
    html: `
      <div class="dora-marker" role="img" aria-label="${escapeHtml(name)} — ${statusLabel}">
        <div class="dora-marker__pin">
          <span class="dora-marker__diamond ${statusClass}"></span>
        </div>
        <div class="dora-marker__label ${stripeClass}">
          <span class="dora-marker__name">${escapeHtml(name)}</span>
          <span class="dora-marker__status">${statusLabel}</span>
        </div>
      </div>
    `,
    iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
    iconAnchor: [MARKER_ANCHOR_X, MARKER_ANCHOR_Y],
    popupAnchor: [0, -MARKER_ANCHOR_Y],
  })
}
