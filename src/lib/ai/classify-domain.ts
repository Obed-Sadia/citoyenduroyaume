'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'

const VALID_IDS = new Set<string>(DOMAIN_META.map((d) => d.id))

const PROMPT =
  `Tu es un assistant de classification théologique pour l'application BASILEIA.\n` +
  `Les 7 Domaines du Royaume sont :\n` +
  `- roi : La nature, l'identité et le règne de Dieu le Roi\n` +
  `- territoire : Le territoire intérieur, la terre promise, l'espace de règne\n` +
  `- citoyens : La communauté, les relations, le corps du Christ\n` +
  `- constitution : La Parole comme loi fondamentale, les promesses\n` +
  `- lois : Les principes, les commandements, la sagesse pratique\n` +
  `- gouvernement : L'autorité spirituelle, la délégation, le leadership\n` +
  `- privileges : Les droits, les bénédictions, l'héritage du Royaume\n\n` +
  `Lis ce texte et réponds UNIQUEMENT par l'identifiant du domaine le plus pertinent\n` +
  `(un seul mot parmi : roi, territoire, citoyens, constitution, lois, gouvernement, privileges).\n\n` +
  `Texte : `

export async function classifyDomain(text: string): Promise<DomainId | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(PROMPT + text)
    const raw = result.response.text().trim().toLowerCase()
    if (VALID_IDS.has(raw)) return raw as DomainId
    const validPattern = new RegExp(`\\b(${[...VALID_IDS].join('|')})\\b`)
    const match = raw.match(validPattern)
    return (match ? match[1] : null) as DomainId | null
  } catch {
    return null
  }
}
