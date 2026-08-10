import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-cw-lg border border-dashed border-cw-border-subtle bg-cw-surface/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-bg-elevated">
        <Icon className="h-5 w-5 text-cw-text-dim" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-sm font-medium text-cw-text">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-cw-text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
