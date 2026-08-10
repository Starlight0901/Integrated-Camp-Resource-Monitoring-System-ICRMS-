import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'

const actionClasses =
  'inline-flex items-center justify-center rounded-cw-md border border-cw-border bg-cw-surface px-4 py-2 text-xs font-medium text-cw-text-muted transition-colors hover:border-cw-border hover:bg-cw-surface-hover hover:text-cw-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg'

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function ActionButton({ className, children, ...props }: ActionButtonProps) {
  return (
    <button type="button" className={cn(actionClasses, className)} {...props}>
      {children}
    </button>
  )
}

export interface ActionLinkProps {
  to: string
  children: ReactNode
  className?: string
}

export function ActionLink({ to, children, className }: ActionLinkProps) {
  return (
    <Link to={to} className={cn(actionClasses, className)}>
      {children}
    </Link>
  )
}
