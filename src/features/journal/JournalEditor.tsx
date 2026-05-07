// src/features/journal/JournalEditor.tsx
"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { ArrowLeft } from 'lucide-react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { DomainBadge } from '@/features/journal/DomainBadge'

interface JournalEditorProps {
  id: string
}

export function JournalEditor({ id }: JournalEditorProps) {
  const router = useRouter()
  const { getNoteById, updateNote } = useNotesStore()
  const note = getNoteById(id)

  const [title, setTitle] = useState(note?.title ?? '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Commence à écrire…' }),
      CharacterCount,
    ],
    content: note?.content ?? '',
    onUpdate({ editor }) {
      setSaveStatus('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const html = editor.getHTML()
        const text = editor.getText()
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const excerpt = text.slice(0, 120)
        updateNote(id, { content: html, excerpt, wordCount: words })
        setSaveStatus('saved')
      }, 1000)
    },
  })

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleTitleChange(value: string) {
    setTitle(value)
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(id, { title: value })
      setSaveStatus('saved')
    }, 1000)
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Note introuvable.
        </p>
        <button
          onClick={() => router.push('/journal')}
          className="mt-4 text-[12px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-amber-400)' }}
        >
          ← Retour au journal
        </button>
      </div>
    )
  }

  const words = editor?.storage.characterCount?.words() ?? 0

  return (
    <div className="flex h-full flex-col">
      <header
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Retour"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sans titre"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium outline-none placeholder:opacity-30"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-primary)' }}
        />

        {note.domain && <DomainBadge domain={note.domain} />}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <EditorContent editor={editor} />
      </div>

      <footer
        className="flex shrink-0 items-center justify-between border-t px-6 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {words} mot{words !== 1 ? 's' : ''}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {saveStatus === 'saving' ? 'Modification en cours…' : 'Enregistré'}
        </span>
      </footer>
    </div>
  )
}
