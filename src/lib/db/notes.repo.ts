import { getDb } from './basileia.db'
import type { Note } from '@/features/journal/mock-notes'

export const NotesRepo = {
  async getAll(): Promise<Note[]> {
    return getDb().notes.orderBy('createdAt').reverse().toArray()
  },

  async add(note: Note): Promise<void> {
    await getDb().notes.put(note)
  },

  async update(id: string, patch: Partial<Note>): Promise<void> {
    await getDb().notes.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await getDb().notes.delete(id)
  },
}
