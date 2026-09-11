import type { HTMLAttributes } from 'react'
import { cn } from '@/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-cw-sm bg-cw-border-subtle/80 animate-cw-skeleton',
        className,
      )}
      aria-hidden
      {...props}
    />
  )
}

export function CampCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-cw-lg border border-cw-border-subtle bg-cw-surface shadow-cw-card">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-cw-border-subtle pt-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-2.5 w-10" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-cw-border-subtle pt-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-cw-lg border border-cw-border-subtle bg-cw-surface shadow-cw-card">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-cw-md" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-cw-lg border border-cw-border-subtle bg-cw-surface shadow-cw-elevated',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-cw-border-subtle px-4 py-3">
        <Skeleton className="h-8 w-8 rounded-cw-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="relative min-h-0 flex-1 bg-cw-bg-elevated">
        <Skeleton className="absolute inset-0 rounded-none opacity-40" />
      </div>
    </div>
  )
}

export function OverviewPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <section className="space-y-0">
        <MapSkeleton className="h-[56vh] min-h-[380px] sm:min-h-[440px] lg:h-[68vh] lg:min-h-[540px]" />
      </section>
      <section className="space-y-5">
        <div className="space-y-2 border-b border-cw-border-subtle pb-3">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CampCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function CampDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="space-y-4 border-b border-cw-border-subtle pb-6">
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-40 w-full rounded-cw-lg" />
      <div className="space-y-4">
        <div className="space-y-2 border-b border-cw-border-subtle pb-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="flex h-[420px] flex-col justify-end gap-3 px-2 pb-4">
      <div className="flex h-full items-end justify-between gap-1">
        {Array.from({ length: 24 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-full max-w-[12px] rounded-t-sm"
            style={{ height: `${30 + (index % 5) * 12}%` }}
          />
        ))}
      </div>
      <Skeleton className="mx-auto h-3 w-40" />
    </div>
  )
}
