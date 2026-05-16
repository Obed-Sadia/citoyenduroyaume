import { getDb } from './basileia.db'
import type { Verse } from './basileia.db'

export const VersesRepo = {
  async getAll(): Promise<Verse[]> {
    return getDb().verses.orderBy('createdAt').reverse().toArray()
  },

  async add(verse: Verse): Promise<void> {
    await getDb().verses.put(verse)
  },

  async remove(id: string): Promise<void> {
    await getDb().verses.delete(id)
  },

  async getById(id: string): Promise<Verse | undefined> {
    return getDb().verses.get(id)
  },
}
