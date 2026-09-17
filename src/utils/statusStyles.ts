import type { AlarmSeverity, CampStatus } from '@/types'
import { cn } from './cn'

export const CAMP_STATUS_LABELS: Record<CampStatus, string> = {
  online: 'NORMAL',
  warning: 'WARNING',
  critical: 'CRITICAL',
  offline: 'OFFLINE',
}

export const ALARM_SEVERITY_LABELS: Record<AlarmSeverity, string> = {
  warning: 'WARNING',
  critical: 'CRITICAL',
}

interface StatusStyle {
  label: string
  dot: string
  badge: string
  glow: string
  text: string
  border: string
}

export const campStatusStyles: Record<CampStatus, StatusStyle> = {
  online: {
    label: CAMP_STATUS_LABELS.online,
    dot: 'bg-cw-status-normal',
    badge:
      'bg-cw-status-normal-bg text-cw-status-normal border-cw-status-normal/30',
    glow: '',
    text: 'text-cw-status-normal',
    border: 'border-cw-status-normal/40',
  },
  warning: {
    label: CAMP_STATUS_LABELS.warning,
    dot: 'bg-cw-status-warning',
    badge:
      'bg-cw-status-warning-bg text-cw-status-warning border-cw-status-warning/25',
    glow: '',
    text: 'text-cw-status-warning',
    border: 'border-cw-status-warning/40',
  },
  critical: {
    label: CAMP_STATUS_LABELS.critical,
    dot: 'bg-cw-status-critical',
    badge:
      'bg-cw-status-critical-bg text-cw-status-critical border-cw-status-critical/25',
    glow: '',
    text: 'text-cw-status-critical',
    border: 'border-cw-status-critical/40',
  },
  offline: {
    label: CAMP_STATUS_LABELS.offline,
    dot: 'bg-cw-status-offline',
    badge:
      'bg-cw-status-offline-bg text-cw-status-offline border-cw-status-offline/30',
    glow: '',
    text: 'text-cw-status-offline',
    border: 'border-cw-status-offline/40',
  },
}

export const alarmSeverityStyles: Record<AlarmSeverity, StatusStyle> = {
  warning: {
    label: ALARM_SEVERITY_LABELS.warning,
    dot: 'bg-cw-status-warning',
    badge:
      'bg-cw-status-warning-bg text-cw-status-warning border-cw-status-warning/25',
    glow: '',
    text: 'text-cw-status-warning',
    border: 'border-cw-status-warning/40',
  },
  critical: {
    label: ALARM_SEVERITY_LABELS.critical,
    dot: 'bg-cw-status-critical',
    badge:
      'bg-cw-status-critical-bg text-cw-status-critical border-cw-status-critical/25',
    glow: '',
    text: 'text-cw-status-critical',
    border: 'border-cw-status-critical/40',
  },
}

export function getCampStatusStyle(status: CampStatus): StatusStyle {
  return campStatusStyles[status]
}

export function getAlarmSeverityStyle(severity: AlarmSeverity): StatusStyle {
  return alarmSeverityStyles[severity]
}

export function statusDotClasses(
  status: CampStatus,
  options?: { pulse?: boolean; glow?: boolean },
): string {
  const style = campStatusStyles[status]
  return cn(
    'inline-block h-2 w-2 shrink-0 rounded-full',
    style.dot,
    options?.pulse && status !== 'offline' && status !== 'online' && 'animate-cw-pulse-dot',
    options?.glow && style.glow,
  )
}

export const SYSTEM_STATUS_LABEL: Record<CampStatus, string> = {
  online: 'System Normal',
  warning: 'System Degraded',
  critical: 'Critical Alerts Active',
  offline: 'System Offline',
}
