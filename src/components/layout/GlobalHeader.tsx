import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { AlarmBellPanel } from '@/components/alarms'
import { useAlarms, useCamps } from '@/hooks'
import { ThemeToggle } from '@/theme'

export function GlobalHeader() {
  const campsState = useCamps()
  const alarmsState = useAlarms()

  return (
    <header className="sticky top-0 z-50 border-b border-cw-border-subtle bg-cw-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-3 lg:px-10">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-cw-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated">
            <Activity className="h-4 w-4 text-cw-brand" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-cw-text lg:text-lg">
              ICRMS
            </h1>
            <p className="hidden truncate text-[11px] text-cw-text-dim sm:block">
              Integrated Camp Resource Monitoring System
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2.5">
          <ThemeToggle />
          <AlarmBellPanel
            alarms={alarmsState.data ?? []}
            loading={alarmsState.loading || campsState.loading}
          />
        </div>
      </div>
    </header>
  )
}
