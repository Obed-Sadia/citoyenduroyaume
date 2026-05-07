// src/lib/stores/notes.store.ts
import { create } from 'zustand'
import { MOCK_NOTES } from '@/features/journal/mock-notes'
import type { Note } from '@/features/journal/mock-notes'

interface NotesStore {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  getNoteById: (id: string) => Note | undefined
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: MOCK_NOTES,
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  getNoteById: (id) => get().notes.find((n) => n.id === id),
}))
