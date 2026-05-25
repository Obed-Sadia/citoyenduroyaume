import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { GlassPanel, type GlassVariant } from './GlassPanel'

interface BentoGridProps {
  cols?: 2 | 3 | 4
  className?: string
  children: ReactNode
}

interface BentoCellProps {
  span?: 1 | 2 | 3 | 4
  variant?: GlassVariant
  className?: string
  children: ReactNode
}

const COLS_CLASS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const SPAN_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: '',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
}

export function BentoGrid({ cols = 3, className, children }: BentoGridProps) {
  return (
    <div
      className={cn('grid', COLS_CLASS[cols], className)}
      style={{ gap: 'var(--bento-gap)' }}
    >
      {children}
    </div>
  )
}

export function BentoCell({
  span = 1,
  variant = 'base',
  className,
  children,
}: BentoCellProps) {
  return (
    <GlassPanel
      variant={variant}
      className={cn('p-[13px]', SPAN_CLASS[span], className)}
    >
      {children}
    </GlassPanel>
  )
}
