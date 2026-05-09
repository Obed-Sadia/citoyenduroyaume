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
  }
}

export const db = new BasileiaDB()
