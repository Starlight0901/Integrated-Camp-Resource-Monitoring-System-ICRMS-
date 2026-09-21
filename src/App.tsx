import { Routes, Route } from 'react-router-dom'
import { AppShellLayout } from '@/layouts/AppShellLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { CampDashboardPage } from '@/pages/CampDashboardPage'
import { DorasPage } from '@/pages/DorasPage'
import { DoraDashboardPage } from '@/pages/DoraDashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="doras" element={<DorasPage />} />
        <Route path="doras/:doraId" element={<DoraDashboardPage />} />
        <Route path="camp/:campId" element={<CampDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
