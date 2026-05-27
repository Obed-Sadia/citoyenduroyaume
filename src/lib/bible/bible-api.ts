'use server'

import { findBibleByAbbrev, type BibleVersion } from '@/lib/bible/bible-versions'

const BASE = 'https://api.scripture.api.bible/v1'

function apiHeaders(): HeadersInit {
  return { 'api-key': process.env.BIBLE_API_KEY ?? '' }
}

let biblesCache: BibleVersion[] | null = null

export async function getAvailableBibles(): Promise<BibleVersion[]> {
  if (biblesCache) return biblesCache
  try {
    const res = await fetch(`${BASE}/bibles`, { headers: apiHeaders(), next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    biblesCache = (json.data as Array<{ id: string; abbreviation: string; name: string; language?: { id: string } }>).map(
      (b) => ({
        id: b.id,
        abbreviation: b.abbreviation ?? '',
        name: b.name,
        language: b.language?.id ?? 'unknown',
      })
    )
    return biblesCache!
  } catch {
    return []
  }
}

export async function resolveBibleId(abbreviation: string): Promise<string> {
  const bibles = await getAvailableBibles()
  const found = findBibleByAbbrev(bibles, abbreviation)
  if (found) return found.id
  const french = bibles.find((b) => b.language === 'fra' || b.language === 'fre')
  return french?.id ?? bibles[0]?.id ?? ''
}

export interface BibleBook {
  id: string
  name: string
}

export async function getBooks(bibleId: string): Promise<BibleBook[]> {
  try {
    const res = await fetch(`${BASE}/bibles/${bibleId}/books`, {
      headers: apiHeaders(),
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as Array<{ id: string; name: string }>).map((b) => ({
      id: b.id,
      name: b.name,
    }))
  } catch {
    return []
  }
}

export interface BibleChapter {
  id: string
  number: string
}

export async function getChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
  try {
    const res = await fetch(`${BASE}/bibles/${bibleId}/books/${bookId}/chapters`, {
      headers: apiHeaders(),
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as Array<{ id: string; number: string }>)
      .filter((c) => c.number !== 'intro')
      .map((c) => ({ id: c.id, number: c.number }))
  } catch {
    return []
  }
}

export interface BibleVerse {
  id: string
  verseNumber: number
  text: string
  reference: string
}

export async function getChapterVerses(
  bibleId: string,
  chapterId: string,
  bookName: string,
  chapterNumber: string
): Promise<BibleVerse[]> {
  try {
    const url = `${BASE}/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-verse-numbers=true&include-titles=false&include-chapter-numbers=false`
    const res = await fetch(url, { headers: apiHeaders(), next: { revalidate: 86400 } })
    if (!res.ok) return []
    const json = await res.json()
    const raw: string = json.data?.content ?? ''
    // Parse "[1] text [2] text…" format
    const matches = [...raw.matchAll(/\[(\d+)\]\s*([^\[]+)/g)]
    return matches.map((m) => {
      const vn = parseInt(m[1], 10)
      return {
        id: `${chapterId}.${vn}`,
        verseNumber: vn,
        text: m[2].trim().replace(/\s+/g, ' '),
        reference: `${bookName} ${chapterNumber}:${vn}`,
      }
    })
  } catch {
    return []
  }
}

export async function searchVerses(bibleId: string, query: string): Promise<BibleVerse[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `${BASE}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=20`,
      { headers: apiHeaders() }
    )
    if (!res.ok) return []
    const json = await res.json()
    return ((json.data?.verses ?? []) as Array<{ id: string; text: string; reference: string }>).map(
      (v) => ({
        id: v.id,
        verseNumber: 0,
        text: v.text,
        reference: v.reference,
      })
    )
  } catch {
    return []
  }
}
