// src/features/carte/domain-constants.ts

export type DomainId =
  | 'roi' | 'territoire' | 'citoyens'
  | 'constitution' | 'lois'
  | 'gouvernement' | 'privileges'

export type ExplorationLevel = 0 | 1 | 2 | 3 | 4 | 5

export const FILL: Record<ExplorationLevel, string> = {
  5: '#6B9FD4',
  4: 'rgba(107,159,212,0.55)',
  3: 'rgba(107,159,212,0.28)',
  2: 'rgba(107,159,212,0.14)',
  1: 'rgba(180,195,210,0.10)',
  0: 'rgba(180,195,210,0.10)',
}

export const STROKE: Record<ExplorationLevel, { color: string; width: number }> = {
  5: { color: 'rgba(107,159,212,0.40)', width: 0.8 },
  4: { color: 'rgba(107,159,212,0.28)', width: 0.8 },
  3: { color: 'rgba(107,159,212,0.20)', width: 0.8 },
  2: { color: 'rgba(107,159,212,0.14)', width: 0.8 },
  1: { color: 'rgba(180,195,210,0.25)', width: 0.5 },
  0: { color: 'rgba(180,195,210,0.15)', width: 0.5 },
}

export const DOMAIN_META: Array<{ id: DomainId; label: string; abbr: string }> = [
  { id: 'roi',          label: 'Le Roi',          abbr: 'ROI'   },
  { id: 'territoire',   label: 'Le Territoire',   abbr: 'TERR'  },
  { id: 'citoyens',     label: 'Les Citoyens',    abbr: 'CIT'   },
  { id: 'constitution', label: 'La Constitution', abbr: 'CONST' },
  { id: 'lois',         label: 'Les Lois',        abbr: 'LOIS'  },
  { id: 'gouvernement', label: 'Le Gouvernement', abbr: 'GOUV'  },
  { id: 'privileges',   label: 'Les Privilèges',  abbr: 'PRIV'  },
]
