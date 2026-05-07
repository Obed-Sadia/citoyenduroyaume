"use client"

import type { CSSProperties, ReactNode } from 'react'
import { useProfilStore } from '@/lib/stores/profil.store'

const SELECT_STYLE: CSSProperties = {
  fontSize:     '11px',
  color:        'var(--color-text-secondary)',
  background:   'rgba(255,255,255,0.05)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding:      '4px 10px',
  appearance:   'none',
  cursor:       'pointer',
  outline:      'none',
}

function PreferenceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

export function PreferencesForm() {
  const {
    locale,            setLocale,
    bible_translation, setBibleTranslation,
    theme,             setTheme,
    editor_font,       setEditorFont,
    font_size,         setFontSize,
  } = useProfilStore()

  return (
    <div>
      <PreferenceRow label="Langue">
        <select value={locale} onChange={(e) => setLocale(e.target.value)} style={SELECT_STYLE}>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="es">Español</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Traduction biblique">
        <select
          value={bible_translation}
          onChange={(e) => setBibleTranslation(e.target.value)}
          style={SELECT_STYLE}
        >
          {['LSG', 'NEG', 'NBS', 'KJV', 'NVI'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </PreferenceRow>

      <PreferenceRow label="Thème">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'system')}
          style={SELECT_STYLE}
        >
          <option value="dark">Sombre</option>
          <option value="light">Clair</option>
          <option value="system">Système</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Police éditoriale">
        <select
          value={editor_font}
          onChange={(e) => setEditorFont(e.target.value as 'cormorant' | 'dm-sans' | 'literata')}
          style={SELECT_STYLE}
        >
          <option value="cormorant">Cormorant</option>
          <option value="dm-sans">DM Sans</option>
          <option value="literata">Literata</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Taille du texte">
        <select
          value={font_size}
          onChange={(e) => setFontSize(e.target.value as 'sm' | 'md' | 'lg')}
          style={SELECT_STYLE}
        >
          <option value="sm">Petite</option>
          <option value="md">Normale</option>
          <option value="lg">Grande</option>
        </select>
      </PreferenceRow>
    </div>
  )
}
