import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

export type GlassVariant = 'base' | 'accent' | 'strong'

const VARIANT_STYLES: Record<GlassVariant, CSSProperties> = {
  base: {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
  },
  accent: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--color-border-mid)',
  },
  strong: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-mid)',
  },
}

interface GlassPanelProps {
  variant?: GlassVariant
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function GlassPanel({
  variant = 'base',
  className,
  style,
  children,
}: GlassPanelProps) {
  return (
    <div
      className={cn('rounded-[var(--bento-radius)] backdrop-blur-[16px]', className)}
      style={{ ...VARIANT_STYLES[variant], ...style }}
    >
      {children}
    </div>
  )
}
