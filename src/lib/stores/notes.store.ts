// src/lib/stores/notes.store.ts
import { create } from 'zustand'
import { NotesRepo } from '@/lib/db/notes.repo'
import { syncNote, deleteNote } from '@/lib/supabase/sync'
import type { Note } from '@/features/journal/mock-notes'

interface NotesStore {
  notes: Note[]
  isLoaded: boolean
  loadFromDb: () => Promise<void>
  addNote: (note: Note) => Promise<void>
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>
  removeNote: (id: string) => Promise<void>
  getNoteById: (id: string) => Note | undefined
  reset: () => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoaded: false,

  loadFromDb: async () => {
    if (get().isLoaded) return
    try {
      const notes = await NotesRepo.getAll()
      set({ notes, isLoaded: true })
    } catch (err) {
      console.error('[NotesStore] loadFromDb failed', err)
      set({ isLoaded: true })
    }
  },

  addNote: async (note) => {
    set((state) => ({ notes: [note, ...state.notes] }))
    try {
      await NotesRepo.add(note)
      void syncNote(note)
    } catch (err) {
      set((state) => ({ notes: state.notes.filter((n) => n.id !== note.id) }))
      console.error('[NotesStore] addNote failed', err)
    }
  },

  updateNote: async (id, patch) => {
    const now = new Date().toISOString()
    const patchWithDate = { ...patch, updatedAt: now }
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patchWithDate } : n)),
    }))
    try {
      await NotesRepo.update(id, patchWithDate)
      const updated = get().notes.find((n) => n.id === id)
      if (updated) void syncNote(updated)
    } catch (err) {
      console.error('[NotesStore] updateNote failed', err)
    }
  },

  removeNote: async (id) => {
    const prev = get().notes
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
    try {
      await NotesRepo.remove(id)
      void deleteNote(id)
    } catch (err) {
      set({ notes: prev })
      console.error('[NotesStore] removeNote failed', err)
    }
  },

  getNoteById: (id) => get().notes.find((n) => n.id === id),

  reset: () => set({ notes: [], isLoaded: false }),
}))
