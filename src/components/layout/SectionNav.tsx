import { NavLink } from 'react-router-dom'
import { cn } from '@/utils'

const sections = [
  { to: '/', label: 'Camps', end: true },
  { to: '/doras', label: 'DORAs', end: true },
] as const

export function SectionNav() {
  return (
    <nav aria-label="Monitoring sections" className="mb-5 lg:mb-6">
      <div className="inline-flex w-full rounded-cw-md border border-cw-border-subtle bg-cw-surface p-1 shadow-cw-card sm:w-auto">
        {sections.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            end={section.end}
            className={({ isActive }) =>
              cn(
                'flex-1 rounded-cw-sm px-4 py-2 text-center text-sm font-medium transition-colors sm:flex-none sm:min-w-[7.5rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40',
                isActive
                  ? 'bg-cw-brand-subtle text-cw-text'
                  : 'text-cw-text-muted hover:bg-cw-surface-hover hover:text-cw-text',
              )
            }
          >
            {section.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
