// src/features/carte/domain-constants.ts

export type DomainId =
  | 'roi' | 'territoire' | 'citoyens'
  | 'constitution' | 'lois'
  | 'gouvernement' | 'privileges'

export type ExplorationLevel = 0 | 1 | 2 | 3 | 4 | 5

const R    = 22
const S3O2 = parseFloat((R * Math.sqrt(3) / 2).toFixed(2))
const RH   = R / 2

export function hexPoints(cx: number, cy: number): string {
  return [
    [cx,        cy - R ],
    [cx + S3O2, cy - RH],
    [cx + S3O2, cy + RH],
    [cx,        cy + R ],
    [cx - S3O2, cy + RH],
    [cx - S3O2, cy - RH],
  ].map(([x, y]) => `${x},${y}`).join(' ')
}

export const FILL: Record<ExplorationLevel, string> = {
  5: '#EF9F27',
  4: '#BA7517',
  3: '#854F0B',
  2: '#633806',
  1: 'rgba(120,115,110,0.18)',
  0: 'rgba(120,115,110,0.07)',
}

export const STROKE: Record<ExplorationLevel, { color: string; width: number }> = {
  5: { color: 'rgba(255,255,255,0.18)', width: 0.8  },
  4: { color: 'rgba(255,255,255,0.12)', width: 0.8  },
  3: { color: 'rgba(255,255,255,0.10)', width: 0.8  },
  2: { color: 'rgba(255,255,255,0.08)', width: 0.8  },
  1: { color: 'rgba(120,115,110,0.50)', width: 0.5  },
  0: { color: 'rgba(120,115,110,0.35)', width: 0.22 },
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
