import { Outlet, useLocation } from 'react-router-dom'
import { GlobalHeader, SectionNav } from '@/components/layout'

function isSectionLanding(pathname: string) {
  return pathname === '/' || pathname === '/doras'
}

export function AppShellLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader />
      <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 pb-10 pt-5 lg:px-10 lg:pb-12 lg:pt-6">
        {isSectionLanding(pathname) ? <SectionNav /> : null}
        <Outlet />
      </main>
    </div>
  )
}
