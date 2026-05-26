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
      className={cn(
        'rounded-[var(--bento-radius)] border p-[12px_14px] flex flex-col gap-1.5 transition-colors duration-150',
        wide && 'col-span-2',
        accent
          ? 'bg-[var(--color-accent-bg)] border-[var(--color-accent-border)]'
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
    <span className={cn('text-[20px] font-normal text-[var(--color-accent)] leading-none', className)}>
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
