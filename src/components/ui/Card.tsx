import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'raised' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const

const variantClasses = {
  default: 'bg-cw-surface border-cw-border-subtle shadow-cw-card',
  raised: 'bg-cw-surface-raised border-cw-border shadow-cw-card',
  interactive:
    'bg-cw-surface border-cw-border-subtle shadow-cw-card cursor-pointer transition-[border-color,background-color,box-shadow] duration-200 hover:border-cw-border hover:bg-cw-surface-hover hover:shadow-cw-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg',
} as const

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-cw-lg border',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
