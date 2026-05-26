interface MetricBlockProps {
  value:  string | number
  label:  string
  amber?: boolean
  small?: boolean
}

export function MetricBlock({ value, label, amber = false, small = false }: MetricBlockProps) {
  return (
    <div
      className="rounded-[6px]"
      style={{ background: 'rgba(255,255,255,0.04)', padding: '11px 13px' }}
    >
      <p
        className="font-medium leading-none"
        style={{
          fontSize: small ? '14px' : '21px',
          color:    amber ? 'var(--color-text-accent)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </p>
      <p
        className="mt-1.5 leading-tight"
        style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
    </div>
  )
}
