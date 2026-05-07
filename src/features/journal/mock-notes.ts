import type { DomainId } from '@/features/carte/domain-constants'

export interface Note {
  id: string
  title: string
  excerpt: string
  domain: DomainId | null
  createdAt: string // ISO 8601
  wordCount: number
}

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: 'La paix qui surpasse tout entendement',
    excerpt:
      "En méditant sur Philippiens 4:7, j'ai réalisé que cette paix n'est pas une absence de tempête mais une présence au milieu d'elle. Le Roi règne même dans le chaos.",
    domain: 'roi',
    createdAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    wordCount: 312,
  },
  {
    id: '2',
    title: '',
    excerpt:
      "Quelques réflexions sur la souveraineté divine dans les petites choses du quotidien. Rien n'échappe à la Constitution du Royaume.",
    domain: 'constitution',
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    wordCount: 87,
  },
  {
    id: '3',
    title: "Le territoire de l'âme",
    excerpt: '',
    domain: 'territoire',
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    wordCount: 24,
  },
  {
    id: '4',
    title: 'Méditation sur la grâce',
    excerpt:
      "La grâce n'est pas simplement une faveur accordée, c'est une transformation profonde qui remodèle l'identité du Citoyen du Royaume.",
    domain: null,
    createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    wordCount: 445,
  },
]
