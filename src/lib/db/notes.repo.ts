// src/lib/db/notes.repo.ts
import { db } from './basileia.db'
import type { Note } from '@/features/journal/mock-notes'

export const NotesRepo = {
  async getAll(): Promise<Note[]> {
    return db.notes.orderBy('createdAt').reverse().toArray()
  },

  async add(note: Note): Promise<void> {
    await db.notes.put(note)
  },

  async update(id: string, patch: Partial<Note>): Promise<void> {
    await db.notes.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await db.notes.delete(id)
  },
}
