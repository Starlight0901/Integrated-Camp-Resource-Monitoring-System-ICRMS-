import { Routes, Route } from 'react-router-dom'
import { AppShellLayout } from '@/layouts/AppShellLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { CampDashboardPage } from '@/pages/CampDashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="camp/:campId" element={<CampDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
