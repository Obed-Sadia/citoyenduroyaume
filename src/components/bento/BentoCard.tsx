import { cn } from '@/lib/utils'

interface BentoCardProps {
  label?: string
  wide?: boolean
  accent?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export function BentoCard({ label, wide, accent, className, onClick, children }: BentoCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'rounded-[var(--bento-radius)] border p-[12px_14px] flex flex-col gap-1.5 transition-colors duration-150',
        wide && 'col-span-2',
        accent
          ? 'bg-[rgba(255,255,255,0.04)] border-[var(--color-border-mid)]'
          : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]',
        onClick && 'cursor-pointer hover:border-[var(--color-border-mid)] hover:bg-[var(--color-bg-elevated)]',
        className
      )}
    >
      {label && (
        <p className="text-[8px] font-medium tracking-[.10em] uppercase text-[var(--color-text-muted)] mb-1">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

export function BentoVal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-[family-name:var(--font-editorial)] text-[26px] font-normal text-[var(--color-text-primary)] leading-none tracking-[-0.02em]', className)}>
      {children}
    </span>
  )
}

export function BentoSub({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] text-[var(--color-text-muted)]">
      {children}
    </span>
  )
}
