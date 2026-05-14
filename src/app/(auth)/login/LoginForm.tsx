'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (sbError) {
        setError('Impossible d\'envoyer le code. Réessayez.')
      } else {
        router.push(`/login/verify?email=${encodeURIComponent(email)}`)
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={cn(
          'w-full px-4 py-3 rounded-lg text-sm',
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)]',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:border-[var(--color-accent)]',
          'transition-colors duration-150'
        )}
      />
      {error && (
        <p className="text-xs text-[var(--color-text-secondary)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3 rounded-lg text-sm font-medium',
          'bg-[var(--color-accent)] text-[var(--color-bg-base)]',
          'transition-opacity duration-150',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? 'Envoi…' : 'Recevoir un code'}
      </button>
    </form>
  )
}
