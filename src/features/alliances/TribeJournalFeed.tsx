'use client'

// stub — completed in Task 12
export function TribeJournalFeed({ tribeId }: { tribeId: string }) {
  return (
    <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
      Chargement… ({tribeId})
    </p>
  )
}
