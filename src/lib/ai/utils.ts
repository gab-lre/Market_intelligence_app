// Utilitaires communs pour le pipeline IA

const WORD_TO_NUMBER: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', twenty: '20', thirty: '30', forty: '40',
  fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
}

/**
 * Parse robuste de la réponse JSON d'un modèle IA.
 * 1. Retire les balises markdown ```json
 * 2. Remplace les mots-nombres anglais par des chiffres (ex: "eighty" → 80)
 * 3. JSON.parse() — logue la string brute complète avec signal_id en cas d'échec
 */
export function safeParseAIResponse<T>(raw: string, signalId?: string): T {
  let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
    cleaned = cleaned.replace(new RegExp(`(?<=[:"\\s,\\[])${word}(?=[,}\\]\\s])`, 'gi'), num)
  }

  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    const ctx = signalId ? ` [signal: ${signalId}]` : ''
    console.error(`[AI] JSON parse failed${ctx}:\n${cleaned}`)
    throw err
  }
}
