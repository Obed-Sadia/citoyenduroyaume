'use client'

import { usePathname } from 'next/navigation'
import { useBibleStore } from '@/lib/stores/bible.store'

export function BibleFAB() {
  const pathname = usePathname()
  const open = useBibleStore((s) => s.open)

  // Caché dans l'éditeur Journal — le footer de JournalEditor a son propre bouton
  if (pathname.startsWith('/journal/')) return null

  return (
    <button
      onClick={() => open('read')}
      className="fixed z-30 bottom-[72px] right-4 md:bottom-6 flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-80"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-mid)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}
      aria-label="Ouvrir la Bible"
    >
      <span className="text-[16px]" aria-hidden="true">📖</span>
    </button>
  )
}
