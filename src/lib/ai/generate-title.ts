'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const PROMPT =
  `Tu es un assistant de l'application BASILEIA, journal de méditation sur le Royaume de Dieu.\n` +
  `Lis ce texte et génère un titre court, évocateur, en français (3 à 6 mots).\n` +
  `Le titre doit capturer l'essence spirituelle du texte.\n` +
  `Réponds UNIQUEMENT par le titre, sans guillemets ni ponctuation finale.\n\n` +
  `Texte : `

export async function generateTitle(text: string): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(PROMPT + text)
    const raw = result.response.text().trim()
    return raw.length > 0 && raw.length <= 80 ? raw : null
  } catch {
    return null
  }
}
