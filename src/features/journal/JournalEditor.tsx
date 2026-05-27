// src/features/journal/JournalEditor.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { ArrowLeft } from 'lucide-react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { DomainBadge } from '@/features/journal/DomainBadge'
import { classifyDomain } from '@/lib/ai/classify-domain'
import { generateTitle } from '@/lib/ai/generate-title'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
import { useBibleStore } from '@/lib/stores/bible.store'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

interface JournalEditorProps {
  id: string
}

export function JournalEditor({ id }: JournalEditorProps) {
  const router = useRouter()
  const { getNoteById, updateNote } = useNotesStore()
  const note = getNoteById(id)

  const [title, setTitle] = useState(note?.title ?? '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [visibility, setVisibility] = useState<'private' | 'allies' | 'tribe'>(
    (note?.visibility as 'private' | 'allies' | 'tribe') ?? 'private'
  )
  const [tribeId, setTribeId]               = useState<string | null>(note?.tribe_id ?? null)
  const [myTribes, setMyTribes]             = useState<Array<{ id: string; name: string }>>([])
  const [showTribePicker, setShowTribePicker] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openBible = useBibleStore((s) => s.open)

  const [suggestion, setSuggestion]   = useState<DomainId | null>(null)
  const [classifying, setClassifying] = useState(false)
  const hasAttemptedRef               = useRef(!!note?.domain)
  const classifyingRef                = useRef(false)
  const hasTitleAttemptedRef          = useRef(!!(note?.title))
  const titleTimerRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Commence à écrire…' }),
      CharacterCount,
    ],
    content: note?.content ?? '',
    onUpdate({ editor }) {
      setSaveStatus('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const html    = editor.getHTML()
        const text    = editor.getText()
        const words   = text.trim() ? text.trim().split(/\s+/).length : 0
        const excerpt = text.slice(0, 120)
        updateNote(id, { content: html, excerpt, wordCount: words })
        setSaveStatus('saved')

        if (!hasTitleAttemptedRef.current && !title.trim() && text.length >= 50) {
          hasTitleAttemptedRef.current = true
          if (titleTimerRef.current) clearTimeout(titleTimerRef.current)
          titleTimerRef.current = setTimeout(async () => {
            try {
              const generated = await generateTitle(text)
              if (generated) {
                setTitle(generated)
                updateNote(id, { title: generated })
              }
            } catch {
              // silent — App-Effacement
            }
          }, 30_000)
        }

        if (!hasAttemptedRef.current && !classifyingRef.current && text.length >= 20) {
          hasAttemptedRef.current = true
          classifyingRef.current  = true
          setClassifying(true)
          try {
            const domain = await classifyDomain(text)
            setSuggestion(domain)
          } catch {
            // silent — App-Effacement
          } finally {
            setClassifying(false)
            classifyingRef.current = false
          }
        }
      }, 1000)
    },
  })

  const handleBibleInsert = useCallback((text: string, reference: string) => {
    editor?.chain().focus()
      .insertContent(`<blockquote><p><em>${escapeHtml(text)}</em></p><p>${escapeHtml(reference)}</p></blockquote>`)
      .run()
  }, [editor])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current)
    }
  }, [])

  useEffect(() => {
    import('@/lib/actions/tribes').then(({ getMyTribes }) => {
      void getMyTribes().then((t) => setMyTribes(t.map((x) => ({ id: x.id, name: x.name }))))
    })
  }, [])

  function handleValidateDomain() {
    if (!suggestion) return
    updateNote(id, { domain: suggestion })
    setSuggestion(null)
  }

  function handleDismissSuggestion() {
    setSuggestion(null)
  }

  function cycleVisibility() {
    if (visibility === 'private') {
      setVisibility('allies')
      updateNote(id, { visibility: 'allies', tribe_id: null })
    } else if (visibility === 'allies') {
      setShowTribePicker(true)
    } else {
      setVisibility('private')
      setTribeId(null)
      updateNote(id, { visibility: 'private', tribe_id: null })
    }
  }

  function selectTribe(tid: string) {
    setVisibility('tribe')
    setTribeId(tid)
    setShowTribePicker(false)
    updateNote(id, { visibility: 'tribe', tribe_id: tid })
  }

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
          style={{ color: 'var(--color-text-primary)' }}
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

        {note.domain ? (
          <DomainBadge domain={note.domain} />
        ) : suggestion ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="animate-pulse text-[10px] font-medium tracking-[.06em] uppercase px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)]"
            >
              {DOMAIN_META.find((d) => d.id === suggestion)?.abbr} · Suggéré
            </span>
            <button
              onClick={handleValidateDomain}
              className="text-[10px] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
            >
              Valider
            </button>
            <button
              onClick={handleDismissSuggestion}
              className="text-[10px] text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
              aria-label="Ignorer la suggestion"
            >
              ✕
            </button>
          </div>
        ) : classifying ? (
          <span className="text-[10px] text-[var(--color-text-muted)] animate-pulse shrink-0">…</span>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <EditorContent editor={editor} />
      </div>

      <footer
        className="flex shrink-0 items-center justify-between border-t px-6 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {words} mot{words !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => openBible('insert', handleBibleInsert)}
            className="text-[9px] font-medium tracking-[.07em] uppercase px-2.5 py-1 rounded-[4px] border transition-opacity hover:opacity-70"
            style={{
              color: 'var(--color-text-muted)',
              borderColor: 'var(--color-border)',
              background: 'rgba(255,255,255,0.03)',
              fontFamily: 'var(--font-sans)',
            }}
            aria-label="Ouvrir la Bible et insérer un verset"
          >
            📖 Bible
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={cycleVisibility}
              className="text-[10px] font-medium tracking-[.06em] uppercase transition-opacity hover:opacity-70"
              style={{
                color: visibility === 'private'
                  ? 'var(--color-text-disabled)'
                  : 'var(--color-text-primary)',
              }}
              aria-label="Visibilité du Journal"
            >
              {visibility === 'private' && '◈ Privé'}
              {visibility === 'allies' && '◈ Alliés'}
              {visibility === 'tribe' && '◈ Tribu'}
            </button>
            {showTribePicker && (
              <div className="absolute bottom-full mb-1 left-0 z-10 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] py-1 min-w-[160px]"
                style={{ background: 'var(--color-bg-surface)' }}>
                {myTribes.length === 0 && (
                  <p className="px-3 py-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Aucune Tribu
                  </p>
                )}
                {myTribes.map((t) => (
                  <button key={t.id} onClick={() => selectTribe(t.id)}
                    className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    {t.name}
                  </button>
                ))}
                <button onClick={() => setShowTribePicker(false)}
                  className="block w-full text-left px-3 py-1.5 text-[11px] border-t border-[rgba(255,255,255,0.06)]"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {saveStatus === 'saving' ? 'Modification en cours…' : 'Enregistré'}
          </span>
        </div>
      </footer>
    </div>
  )
}
