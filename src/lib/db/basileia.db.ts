// src/lib/db/basileia.db.ts
import Dexie, { type EntityTable } from 'dexie'
import type { Note } from '@/features/journal/mock-notes'
import type { DomainId } from '@/features/carte/domain-constants'

export interface Secret {
  id: string
  text: string
  domainId?: DomainId
  createdAt: string
}

class BasileiaDB extends Dexie {
  notes!: EntityTable<Note, 'id'>
  secrets!: EntityTable<Secret, 'id'>

  constructor() {
    super('basileia')
    this.version(2).stores({
      notes:   'id, createdAt, domain',
      secrets: 'id, createdAt, domainId',
    })
    this.on('blocked', () => {
      console.warn('[BasileiaDB] upgrade blocked — close other tabs')
    })
  }
}

function createDb(): BasileiaDB {
  const instance = new BasileiaDB()
  instance.open().catch(async (err) => {
    if (err.name === 'UpgradeError' || err.name === 'DatabaseClosedError') {
      console.warn('[BasileiaDB] schema conflict, deleting DB and retrying…', err)
      await Dexie.delete('basileia')
      window.location.reload()
    }
  })
  return instance
}

export const db = createDb()
