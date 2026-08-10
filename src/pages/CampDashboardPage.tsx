import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CampDashboardView } from '@/components/camp/CampDashboardView'
import { useAlarms, useCamp } from '@/hooks'
import { isMetricKey } from '@/utils'
import type { MetricKey } from '@/types'

export function CampDashboardPage() {
  const { campId } = useParams<{ campId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const campState = useCamp(campId)
  const alarmsState = useAlarms(campId)
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null)
  const [highlightedMetric, setHighlightedMetric] = useState<MetricKey | null>(null)

  useEffect(() => {
    const metricParam = searchParams.get('metric')
    if (metricParam && isMetricKey(metricParam)) {
      setSelectedMetric(metricParam)
      setHighlightedMetric(metricParam)
    }
  }, [searchParams])

  const handleMetricClose = () => {
    setSelectedMetric(null)
    if (searchParams.has('metric')) {
      const next = new URLSearchParams(searchParams)
      next.delete('metric')
      setSearchParams(next, { replace: true })
    }
  }

  const handleMetricSelect = (metricKey: MetricKey) => {
    setSelectedMetric(metricKey)
    setHighlightedMetric(metricKey)
    setSearchParams({ metric: metricKey }, { replace: true })
  }

  return (
    <CampDashboardView
      campState={campState}
      alarmsState={alarmsState}
      selectedMetric={selectedMetric}
      highlightedMetric={highlightedMetric}
      onMetricSelect={handleMetricSelect}
      onMetricClose={handleMetricClose}
    />
  )
}
