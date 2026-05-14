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

export interface Verse {
  id: string
  reference: string
  text: string
  domain: DomainId | null
  createdAt: string
}

class BasileiaDB extends Dexie {
  notes!: EntityTable<Note, 'id'>
  secrets!: EntityTable<Secret, 'id'>
  verses!: EntityTable<Verse, 'id'>

  constructor(userId: string) {
    super(`basileia_${userId}`)
    this.version(1).stores({
      notes:   'id, createdAt, domain',
      secrets: 'id, createdAt, domainId',
      verses:  'id, createdAt',
    })
    this.on('blocked', () => {
      console.warn('[BasileiaDB] upgrade blocked — close other tabs')
    })
  }
}

let _db: BasileiaDB | null = null

export async function initDb(userId: string): Promise<void> {
  if (_db) {
    _db.close()
  }
  _db = new BasileiaDB(userId)
  await _db.open()
}

export function getDb(): BasileiaDB {
  if (!_db) throw new Error('[BasileiaDB] not initialized — call await initDb(userId) first')
  return _db
}

export async function closeDb(): Promise<void> {
  if (_db) {
    _db.close()
    _db = null
  }
}
