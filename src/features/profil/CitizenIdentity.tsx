import { Pencil } from 'lucide-react'
import { getInitials, nameToHsl } from '@/lib/utils'

interface CitizenIdentityProps {
  displayName: string
  avatarUrl?:  string | null
  locale?:     string
  createdAt?:  string | null
}

const LOCALE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  pt: 'Português',
  es: 'Español',
}

export function CitizenIdentity({
  displayName,
  avatarUrl,
  locale = 'fr',
  createdAt,
}: CitizenIdentityProps) {
  const initials    = getInitials(displayName)
  const fallbackBg  = nameToHsl(displayName)

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex items-center gap-4">
      <div
        className="shrink-0 w-[46px] h-[46px] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          border:     '1.5px solid rgba(239,159,39,0.40)',
          background: avatarUrl ? undefined : fallbackBg,
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span
            className="text-[14px] font-medium"
            style={{ color: 'var(--color-text-amber)' }}
          >
            {initials}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[15px] font-medium truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {displayName}
        </p>
        {(formattedDate || locale) && (
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {formattedDate && `Citoyen depuis ${formattedDate}`}
            {formattedDate && locale && ' · '}
            {locale && LOCALE_NAMES[locale]}
          </p>
        )}
      </div>

      <button
        className="flex items-center gap-1.5 rounded-[6px] transition-opacity hover:opacity-70"
        style={{
          fontSize:   '11px',
          color:      'var(--color-text-secondary)',
          background: 'rgba(255,255,255,0.05)',
          border:     '1px solid rgba(255,255,255,0.08)',
          padding:    '4px 10px',
        }}
      >
        <Pencil size={11} strokeWidth={1.5} />
        Modifier
      </button>
    </div>
  )
}
