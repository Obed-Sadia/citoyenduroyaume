export interface BibleVersion {
  id: string
  abbreviation: string
  name: string
  language: string
}

export const PREFERRED_VERSIONS = ['LSG', 'NEG', 'NBS', 'KJV', 'NVI'] as const
export type VersionAbbreviation = (typeof PREFERRED_VERSIONS)[number]

export function findBibleByAbbrev(
  bibles: BibleVersion[],
  abbrev: string
): BibleVersion | undefined {
  const upper = abbrev.toUpperCase()
  return (
    bibles.find((b) => b.abbreviation.toUpperCase() === upper) ??
    bibles.find((b) => b.name.toUpperCase().includes(upper))
  )
}
