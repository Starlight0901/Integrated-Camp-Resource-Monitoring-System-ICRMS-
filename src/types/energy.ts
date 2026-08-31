/**
 * Cumulative electrical energy over reporting periods (kWh).
 * Period windows (today / yesterday / this month / last month) are calculated
 * from the current date — see `getEnergyConsumptionPeriods`.
 */
export interface EnergyConsumption {
  today: number
  yesterday: number
  thisMonth: number
  lastMonth: number
}

export const ENERGY_CONSUMPTION_UNIT = 'kWh' as const

export type EnergyConsumptionPeriod = keyof EnergyConsumption

export const ENERGY_CONSUMPTION_PERIODS: readonly {
  key: EnergyConsumptionPeriod
  label: string
}[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
] as const
