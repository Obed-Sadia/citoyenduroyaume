import type { Metadata } from 'next'
import { JournalEditor } from '@/features/journal/JournalEditor'

export const metadata: Metadata = { title: 'Méditation — BASILEIA' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function JournalEntryPage({ params }: Props) {
  const { id } = await params
  return <JournalEditor id={id} />
}
