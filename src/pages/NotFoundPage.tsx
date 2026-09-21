import { ActionLink } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <p className="cw-telemetry-value text-5xl font-semibold text-cw-text-dim">404</p>
      <h1 className="mt-4 text-lg font-semibold text-cw-text">Page not found</h1>
      <p className="mt-2 text-sm text-cw-text-muted">
        The page you requested is not part of the SLNAFMS monitoring console.
      </p>
      <div className="mt-6">
        <ActionLink to="/">Return to overview</ActionLink>
      </div>
    </div>
  )
}
