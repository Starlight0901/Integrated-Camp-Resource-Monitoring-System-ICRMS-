import { Outlet } from 'react-router-dom'
import { GlobalHeader } from '@/components/layout'

export function AppShellLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cw-bg">
      <GlobalHeader />
      <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 pb-10 pt-5 lg:px-10 lg:pb-12 lg:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
