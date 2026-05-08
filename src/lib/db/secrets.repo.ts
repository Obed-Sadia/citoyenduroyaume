import { db } from './basileia.db'
import type { Secret } from './basileia.db'

export const SecretsRepo = {
  async getAll(): Promise<Secret[]> {
    return db.secrets.orderBy('createdAt').reverse().toArray()
  },

  async add(secret: Secret): Promise<void> {
    await db.secrets.put(secret)
  },

  async remove(id: string): Promise<void> {
    await db.secrets.delete(id)
  },
}
