import { Moon, Sun } from 'lucide-react'
import { cn } from '@/utils'
import { useTheme } from './ThemeProvider'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-cw-md border border-cw-border-subtle bg-cw-surface text-cw-text-muted transition-all duration-200',
        'hover:border-cw-border hover:bg-cw-surface-hover hover:text-cw-text',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  )
}
