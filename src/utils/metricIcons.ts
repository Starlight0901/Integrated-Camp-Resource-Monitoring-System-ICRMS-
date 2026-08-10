import {
  Zap,
  Droplets,
  Fuel,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'
import type { MetricKey } from '@/types'

export const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  apparentPower: Zap,
  temperature: Thermometer,
  waterLevel: Droplets,
  fuelLevel: Fuel,
}
