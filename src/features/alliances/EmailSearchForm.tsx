'use client'

import { useState } from 'react'
import { searchCitizenByEmail, sendAllianceRequest } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'

type SearchResult = {
  id: string
  display_name: string
  avatar_url: string | null
}

export function EmailSearchForm() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<SearchResult | null | 'not_found' | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [invited, setInvited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!email.trim()) return
    setLoading(true)
    setResult(undefined)
    setInvited(false)
    setError(null)

    const found = await searchCitizenByEmail(email.trim())
    setResult(found ?? 'not_found')
    setLoading(false)
  }

  async function handleInvite(id: string) {
    setLoading(true)
    const res = await sendAllianceRequest(id)
    if (res.error) {
      setError(res.error)
    } else {
      setInvited(true)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSearch()
          }}
          placeholder="email@exemple.com"
          className="flex-1 rounded-md px-3 py-2 text-[13px] outline-none"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        <button
          onClick={() => void handleSearch()}
          disabled={loading}
          className="px-4 py-2 rounded-md text-[12px] font-medium tracking-wide"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Rechercher
        </button>
      </div>

      {/* Résultat */}
      {result === 'not_found' && (
        <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          Aucun Citoyen trouvé.
        </p>
      )}
      {result && result !== 'not_found' && (
        <div
          className="flex items-center gap-3 rounded-md p-3"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <div
            className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[12px] font-medium"
            style={{
              background: nameToHsl(result.display_name),
              color: 'var(--color-accent)',
              border: '1.5px solid var(--color-accent-border)',
            }}
          >
            {getInitials(result.display_name)}
          </div>
          <span className="flex-1 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
            {result.display_name}
          </span>
          {invited ? (
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              Invitation envoyée ✓
            </span>
          ) : (
            <button
              onClick={() => void handleInvite(result.id)}
              disabled={loading}
              className="px-3 py-1.5 rounded text-[12px] font-medium"
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Inviter
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12px]" style={{ color: 'rgba(255,100,100,0.8)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
