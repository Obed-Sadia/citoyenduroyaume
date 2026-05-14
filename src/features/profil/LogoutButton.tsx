'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const BTN_STYLE = {
  fontSize:     '11px',
  color:        'var(--color-text-secondary)',
  background:   'rgba(255,255,255,0.05)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding:      '4px 10px',
} as const

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout(): Promise<void> {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // AuthProvider listens to SIGNED_OUT and handles reset + redirect
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={BTN_STYLE}
      className={cn('transition-opacity hover:opacity-70', loading && 'opacity-40 cursor-not-allowed')}
    >
      {loading ? 'Déconnexion…' : 'Déconnecter'}
    </button>
  )
}
