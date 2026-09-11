import type { ReactNode } from 'react'
import { cn } from '@/utils'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-cw-border-subtle pb-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cw-text">
          <span
            className="h-3 w-0.5 shrink-0 rounded-full bg-cw-brand"
            aria-hidden
          />
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-cw-text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
