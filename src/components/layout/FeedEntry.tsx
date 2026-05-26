import { cn } from '@/lib/utils'

interface FeedEntryProps {
  title?: string
  verse?: string
  excerpt?: string
  reference?: string
  domain?: string
  date?: string
  tag?: string
  tagAccent?: boolean
  onClick?: () => void
  className?: string
}

export function FeedEntry({
  title,
  verse,
  excerpt,
  reference,
  domain,
  date,
  tag,
  tagAccent,
  onClick,
  className,
}: FeedEntryProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'flex items-start gap-3.5 py-[13px] px-[18px] border-b border-[var(--color-border)] last:border-b-0 transition-colors duration-150 hover:bg-[var(--color-bg-hover)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {title && (
          <p className="font-[family-name:var(--font-editorial)] text-[14px] font-[500] text-[var(--color-text-primary)] leading-[1.3]">
            {title}
          </p>
        )}
        {verse && (
          <p className="font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] leading-[1.65]">
            {verse}
          </p>
        )}
        {excerpt && (
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-[1.6] line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-[5px] flex-wrap">
          {tag && (
            <span className={cn(
              'text-[8px] font-medium tracking-[.06em] uppercase px-[7px] py-[2px] rounded-[3px] border',
              tagAccent
                ? 'border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.05)] text-[var(--color-text-primary)]'
                : 'border-[var(--color-border-mid)] text-[var(--color-text-muted)]'
            )}>
              {tag}
            </span>
          )}
          {reference && (
            <span className="text-[9px] text-[var(--color-text-muted)] tracking-[.04em]">
              {reference}
            </span>
          )}
          {domain && (
            <span className="text-[8px] tracking-[.08em] uppercase text-[var(--color-text-muted)]">
              {domain}
            </span>
          )}
          {date && (
            <span className="text-[8px] text-[var(--color-text-muted)] ml-auto">
              {date}
            </span>
          )}
        </div>
      </div>
      {onClick && (
        <span aria-hidden="true" className="text-[12px] text-[var(--color-text-muted)] opacity-50 mt-[3px] flex-shrink-0">›</span>
      )}
    </div>
  )
}

export function FeedHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between py-[14px]">
      <p className="text-[9px] font-medium tracking-[.12em] uppercase text-[var(--color-text-muted)]">{title}</p>
      {action && (
        <button type="button" onClick={onAction} className="text-[9px] text-[var(--color-text-secondary)] opacity-60 tracking-[.06em] hover:opacity-100 transition-opacity">
          {action} →
        </button>
      )}
    </div>
  )
}
