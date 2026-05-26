interface MetricBlockProps {
  value:     string | number
  label:     string
  highlight?: boolean
  amber?:    boolean
  small?:    boolean
}

export function MetricBlock({ value, label, highlight, amber, small = false }: MetricBlockProps) {
  const isHighlight = highlight ?? amber ?? false
  return (
    <div
      className="rounded-[var(--radius-md)]"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border:     '1px solid var(--color-border)',
        padding:    '12px 14px',
      }}
    >
      <p
        className="font-[family-name:var(--font-editorial)] leading-none"
        style={{
          fontSize:      small ? '14px' : '22px',
          color:         'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          fontWeight:    isHighlight ? 400 : 400,
        }}
      >
        {value}
      </p>
      <p
        className="mt-1.5 font-medium uppercase tracking-[0.04em] leading-tight"
        style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
    </div>
  )
}
