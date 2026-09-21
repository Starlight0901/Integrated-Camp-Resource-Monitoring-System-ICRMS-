import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { AlarmBellPanel } from '@/components/alarms'
import { APP_ACRONYM, APP_NAME, APP_NAME_OFFICIAL } from '@/data/branding'
import { useCamps, useSystemAlarms } from '@/hooks'
import { ThemeToggle } from '@/theme'

export function GlobalHeader() {
  const campsState = useCamps()
  const alarmsState = useSystemAlarms()

  return (
    <header className="sticky top-0 z-50 border-b border-cw-border-subtle bg-cw-surface/90 shadow-cw-card backdrop-blur-md">
      <div className="h-px w-full bg-cw-border-subtle" aria-hidden>
        <div className="h-full w-16 bg-cw-brand/70 sm:w-24" />
      </div>
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-2.5 lg:px-10">
        <Link
          to="/"
          title={APP_NAME_OFFICIAL}
          aria-label={APP_NAME_OFFICIAL}
          className="flex min-w-0 items-center gap-3 rounded-cw-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-cw-md bg-cw-brand-mark text-cw-brand-mark-fg shadow-cw-card">
            <Activity className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-cw-text lg:text-base">
              {APP_ACRONYM}
            </h1>
            <p className="hidden truncate text-[11px] text-cw-text-dim sm:block">
              {APP_NAME}
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
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
