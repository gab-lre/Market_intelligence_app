export const MODELS = {
  CLASSIFIER: 'gpt-4.1-nano',  // Layer 1 — Chat Completions API
  ANALYZER:   'gpt-5-mini',    // Layer 2 — Responses API
  REPORTER:   'gpt-5',         // Layer 3 — Responses API
} as const

export const REASONING_EFFORT = {
  ANALYZER: 'low',    // gpt-5-mini : extraction structurée, latence faible
  REPORTER: 'medium', // gpt-5 : synthèse multi-sources, raisonnement requis
} as const

// Tarifs USD / 1M tokens (mis à jour selon tarifs OpenAI au 07/04/2026)
export const TOKEN_RATES: Record<string, { input: number; output: number }> = {
  'gpt-4.1-nano': { input: 0.10,  output: 0.40  },
  'gpt-5-mini':   { input: 0.25,  output: 2.00  },
  'gpt-5':        { input: 1.25,  output: 10.00 },
}

export type ModelName = typeof MODELS[keyof typeof MODELS]

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = TOKEN_RATES[model] ?? { input: 0, output: 0 }
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
}
