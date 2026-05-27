import { create } from 'zustand'

interface BibleStore {
  isOpen: boolean
  mode: 'read' | 'insert'
  insertCallback: ((text: string, reference: string) => void) | null
  currentBook: string | null
  currentBookName: string | null
  currentChapterId: string | null
  currentChapterNumber: string | null
  open: (mode: 'read' | 'insert', cb?: (text: string, reference: string) => void) => void
  close: () => void
  setBook: (bookId: string, bookName: string) => void
  setChapter: (bookId: string, bookName: string, chapterId: string, chapterNumber: string) => void
}

export const useBibleStore = create<BibleStore>((set) => ({
  isOpen: false,
  mode: 'read',
  insertCallback: null,
  currentBook: null,
  currentBookName: null,
  currentChapterId: null,
  currentChapterNumber: null,

  open: (mode, cb) => set({ isOpen: true, mode, insertCallback: cb ?? null }),
  close: () => set({ isOpen: false, insertCallback: null }),

  setBook: (bookId, bookName) =>
    set({ currentBook: bookId, currentBookName: bookName, currentChapterId: null, currentChapterNumber: null }),

  setChapter: (bookId, bookName, chapterId, chapterNumber) =>
    set({ currentBook: bookId, currentBookName: bookName, currentChapterId: chapterId, currentChapterNumber: chapterNumber }),
}))
