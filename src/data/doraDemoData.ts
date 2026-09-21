import type { Dora } from '@/types'
import { DORA_DEMO_SEEDS } from './doraConstants'
import { clampDoraReadings, deriveDoraStatus } from './doraStatusDerivation'

function buildDoraFromSeed(seed: (typeof DORA_DEMO_SEEDS)[number]): Dora {
  const readings = clampDoraReadings(seed.readings)
  return {
    id: seed.id,
    name: seed.name,
    location: seed.location,
    fuelLevel: readings.fuelLevel,
    powerConsumption: readings.powerConsumption,
    status: deriveDoraStatus(readings),
  }
}

export const dummyDoras: Dora[] = DORA_DEMO_SEEDS.map(buildDoraFromSeed)
