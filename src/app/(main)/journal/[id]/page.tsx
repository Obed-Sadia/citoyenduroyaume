import type { Metadata } from 'next'
import { JournalEditor } from '@/features/journal/JournalEditor'
import { EnluminureMargin } from '@/features/enluminures/EnluminureMargin'

export const metadata: Metadata = { title: 'Méditation — BASILEIA' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function JournalEntryPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <JournalEditor id={id} />
      <EnluminureMargin noteId={id} isAuthor={true} />
    </>
  )
}
