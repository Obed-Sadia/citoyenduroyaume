import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

export type GlassVariant = 'base' | 'accent' | 'strong'

const VARIANT_STYLES: Record<GlassVariant, CSSProperties> = {
  base: {
    background: 'var(--glass-base-bg)',
    border: '1px solid var(--glass-base-border)',
  },
  accent: {
    background: 'var(--glass-accent-bg)',
    border: '1px solid var(--glass-accent-border)',
  },
  strong: {
    background: 'var(--glass-strong-bg)',
    border: '1px solid var(--glass-strong-border)',
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
