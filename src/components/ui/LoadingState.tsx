import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: { spinner: 'h-4 w-4', text: 'text-xs', gap: 'gap-2' },
  md: { spinner: 'h-5 w-5', text: 'text-sm', gap: 'gap-2.5' },
  lg: { spinner: 'h-6 w-6', text: 'text-base', gap: 'gap-3' },
} as const

export function LoadingState({
  message = 'Loading…',
  size = 'md',
  className,
}: LoadingStateProps) {
  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        sizes.gap,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn('animate-cw-spin text-cw-accent', sizes.spinner)}
        strokeWidth={1.75}
      />
      <p className={cn('text-cw-text-muted', sizes.text)}>{message}</p>
    </div>
  )
}
