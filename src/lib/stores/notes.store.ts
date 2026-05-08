// src/lib/stores/notes.store.ts
import { create } from 'zustand'
import { NotesRepo } from '@/lib/db/notes.repo'
import type { Note } from '@/features/journal/mock-notes'

interface NotesStore {
  notes: Note[]
  isLoaded: boolean
  loadFromDb: () => Promise<void>
  addNote: (note: Note) => Promise<void>
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>
  getNoteById: (id: string) => Note | undefined
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
    } catch (err) {
      set((state) => ({ notes: state.notes.filter((n) => n.id !== note.id) }))
      console.error('[NotesStore] addNote failed', err)
    }
  },

  updateNote: async (id, patch) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }))
    try {
      await NotesRepo.update(id, patch)
    } catch (err) {
      console.error('[NotesStore] updateNote failed', err)
    }
  },

  getNoteById: (id) => get().notes.find((n) => n.id === id),
}))
