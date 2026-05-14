import { getDb } from './basileia.db'
import type { Secret } from './basileia.db'

export const SecretsRepo = {
  async getAll(): Promise<Secret[]> {
    return getDb().secrets.orderBy('createdAt').reverse().toArray()
  },

  async add(secret: Secret): Promise<void> {
    await getDb().secrets.put(secret)
  },

  async remove(id: string): Promise<void> {
    await getDb().secrets.delete(id)
  },
}
