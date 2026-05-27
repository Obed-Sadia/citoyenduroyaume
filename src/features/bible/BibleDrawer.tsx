'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useBibleStore } from '@/lib/stores/bible.store'
import { useProfilStore } from '@/lib/stores/profil.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import {
  getBooks,
  getChapters,
  getChapterVerses,
  resolveBibleId,
  searchVerses,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
} from '@/lib/bible/bible-api'
import { PREFERRED_VERSIONS } from '@/lib/bible/bible-versions'
import { cn } from '@/lib/utils'

export function BibleDrawer() {
  const {
    isOpen, mode, insertCallback, close,
    currentBook, currentBookName, currentChapterId, currentChapterNumber,
    setBook, setChapter,
  } = useBibleStore()
  const { bible_translation, setBibleTranslation } = useProfilStore()
  const { addVerse } = useVersesStore()

  const [bibleId, setBibleId]           = useState<string | null>(null)
  const [books, setBooks]               = useState<BibleBook[]>([])
  const [chapters, setChapters]         = useState<BibleChapter[]>([])
  const [verses, setVerses]             = useState<BibleVerse[]>([])
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([])
  const [isSearching, setIsSearching]   = useState(false)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [])

  // Resolve bibleId when version changes
  useEffect(() => {
    resolveBibleId(bible_translation).then(setBibleId).catch(() => setError('Version introuvable.'))
  }, [bible_translation])

  // Load book list when bibleId is resolved
  useEffect(() => {
    if (!bibleId) return
    setError(null)
    getBooks(bibleId).then(setBooks).catch(() => setError('Impossible de charger la Bible.'))
  }, [bibleId])

  // Load chapters when book is selected
  useEffect(() => {
    if (!bibleId || !currentBook) return
    getChapters(bibleId, currentBook).then(setChapters)
  }, [bibleId, currentBook])

  // Load verses when chapter is selected
  useEffect(() => {
    if (!bibleId || !currentChapterId || !currentBookName || !currentChapterNumber) {
      setVerses([])
      return
    }
    setLoadingVerses(true)
    setError(null)
    getChapterVerses(bibleId, currentChapterId, currentBookName, currentChapterNumber)
      .then(setVerses)
      .catch(() => setError('Impossible de charger ce chapitre.'))
      .finally(() => setLoadingVerses(false))
  }, [bibleId, currentChapterId, currentBookName, currentChapterNumber])

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q)
      if (searchTimer.current) clearTimeout(searchTimer.current)
      if (!q.trim()) { setSearchResults([]); return }
      setIsSearching(true)
      searchTimer.current = setTimeout(() => {
        if (!bibleId) { setIsSearching(false); return }
        searchVerses(bibleId, q)
          .then(setSearchResults)
          .catch(() => setSearchResults([]))
          .finally(() => setIsSearching(false))
      }, 300)
    },
    [bibleId]
  )

  function handleVerseAction(verse: BibleVerse) {
    if (mode === 'insert' && insertCallback) {
      insertCallback(verse.text, verse.reference)
      close()
    } else {
      addVerse(verse.reference, verse.text, undefined, 'private')
    }
  }

  const actionLabel = mode === 'insert' ? '↳ Insérer' : 'Ancrer'
  const showSearch  = searchQuery.trim().length > 0
  const verseList   = showSearch ? searchResults : verses

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay desktop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 hidden md:block"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[480px]"
            style={{
              background: 'var(--color-bg-surface)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div
              className="flex shrink-0 items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={close}
                  className="text-[14px] md:hidden transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label="Fermer"
                >
                  ←
                </button>
                <span
                  className="text-[10px] font-medium tracking-[.08em] uppercase"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
                >
                  Bible
                </span>
                <select
                  value={bible_translation}
                  onChange={(e) => setBibleTranslation(e.target.value)}
                  className="rounded-[4px] px-1.5 py-0.5 text-[10px] outline-none cursor-pointer"
                  style={{
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-mid)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {PREFERRED_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={close}
                className="hidden md:block text-[12px] transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* ── Search ─────────────────────────────────────── */}
            <div
              className="shrink-0 px-4 py-2.5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex items-center gap-2 rounded-[5px] px-3 py-2"
                style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-mid)' }}
              >
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>⌕</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Jean 3:16 ou mot-clé…"
                  className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--color-text-disabled)]"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}
                />
                {isSearching && (
                  <span className="text-[10px] animate-pulse" style={{ color: 'var(--color-text-muted)' }}>…</span>
                )}
                {searchQuery && !isSearching && (
                  <button
                    onClick={() => handleSearch('')}
                    className="text-[10px] transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-muted)' }}
                  >✕</button>
                )}
              </div>
            </div>

            {/* ── Main Content ────────────────────────────────── */}
            {error ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              </div>
            ) : showSearch ? (
              /* Search results */
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {searchResults.length === 0 && !isSearching && (
                  <p className="text-[12px] py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    Aucun verset trouvé.
                  </p>
                )}
                {searchResults.map((v) => (
                  <VerseRow key={v.id} verse={v} actionLabel={actionLabel} onAction={handleVerseAction} />
                ))}
              </div>
            ) : (
              /* Book / Chapter / Verse navigation */
              <div className="flex flex-1 overflow-hidden">
                {/* Book list */}
                <div
                  className="w-[130px] shrink-0 border-r overflow-y-auto py-2"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setBook(book.id, book.name)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-[11px] transition-colors',
                        currentBook === book.id
                          ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.06)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                      )}
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {book.name}
                    </button>
                  ))}
                </div>

                {/* Chapter + Verse panel */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Chapter numbers */}
                  {chapters.length > 0 && (
                    <div
                      className="shrink-0 flex flex-wrap gap-1 px-3 py-2 border-b"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {chapters.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            if (!currentBook || !currentBookName) return
                            setChapter(currentBook, currentBookName, ch.id, ch.number)
                          }}
                          className={cn(
                            'text-[10px] w-7 h-7 rounded-[4px] transition-colors',
                            currentChapterId === ch.id
                              ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.10)]'
                              : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.04)]'
                          )}
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {ch.number}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Verse list */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {loadingVerses && (
                      <p className="text-[11px] py-4 text-center animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
                        Chargement…
                      </p>
                    )}
                    {!loadingVerses && verseList.length === 0 && currentChapterId && (
                      <p className="text-[11px] py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        Aucun verset.
                      </p>
                    )}
                    {!loadingVerses && !currentBook && (
                      <p className="text-[11px] py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        Choisis un livre.
                      </p>
                    )}
                    {verseList.map((v) => (
                      <VerseRow key={v.id} verse={v} actionLabel={actionLabel} onAction={handleVerseAction} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface VerseRowProps {
  verse: BibleVerse
  actionLabel: string
  onAction: (verse: BibleVerse) => void
}

function VerseRow({ verse, actionLabel, onAction }: VerseRowProps) {
  return (
    <div
      className="group flex items-start gap-2.5 rounded-[4px] px-2 py-2 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
    >
      {verse.verseNumber > 0 && (
        <span
          className="shrink-0 w-5 text-right text-[9px] pt-[3px]"
          style={{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-sans)' }}
        >
          {verse.verseNumber}
        </span>
      )}
      <p
        className="flex-1 text-[12px] italic leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-editorial)' }}
      >
        {verse.reference && verse.verseNumber === 0 && (
          <span
            className="not-italic text-[9px] tracking-[.06em] uppercase mr-1.5 block mb-0.5"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
          >
            {verse.reference}
          </span>
        )}
        {verse.text}
      </p>
      <button
        onClick={() => onAction(verse)}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-[8px] font-medium tracking-[.06em] uppercase px-2 py-1 rounded-[3px] border transition-all"
        style={{
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border-mid)',
          background: 'rgba(255,255,255,0.06)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {actionLabel}
      </button>
    </div>
  )
}
