import type OpenAI from 'openai'
import { supabase } from '@/lib/supabase'
import { MODELS, estimateCost } from './models'
import { safeParseAIResponse } from './utils'
import type { RawSignal } from '@/types/database'

export interface ClassifierResult {
  passed: RawSignal[]
  discarded: RawSignal[]
  usage: {
    input_tokens: number
    output_tokens: number
    estimated_cost_usd: number
  }
}

interface ClassifyResponse {
  is_opportunity: boolean
  tags: string[]
}

export async function classifySignals(
  client: OpenAI,
  signals: RawSignal[]
): Promise<ClassifierResult> {
  const passed: RawSignal[] = []
  const discarded: RawSignal[] = []
  let totalInput = 0
  let totalOutput = 0

  for (const signal of signals) {
    let isOpportunity = true // fail open par défaut

    try {
      const response = await client.chat.completions.create({
        model: MODELS.CLASSIFIER,
        response_format: { type: 'json_object' },
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: "Tu es un classificateur d'opportunités SaaS. Réponds UNIQUEMENT en JSON valide : {\"is_opportunity\": true|false, \"tags\": [\"tag1\",\"tag2\"]}.",
          },
          {
            role: 'user',
            content: `Titre: ${signal.title ?? ''}\nContenu: ${(signal.content ?? '').slice(0, 300)}`,
          },
        ],
      })

      totalInput += response.usage?.prompt_tokens ?? 0
      totalOutput += response.usage?.completion_tokens ?? 0

      const raw = response.choices[0]?.message?.content ?? '{}'
      const parsed: ClassifyResponse = safeParseAIResponse<ClassifyResponse>(raw, signal.id)
      isOpportunity = parsed.is_opportunity !== false // si le champ est absent → true
    } catch (err) {
      // En cas d'erreur (réseau, parse JSON) : on laisse passer le signal
      console.warn(`[Classifier] Erreur sur signal ${signal.id} — fail open:`, (err as Error).message)
    }

    if (isOpportunity) {
      passed.push(signal)
    } else {
      discarded.push(signal)
      await supabase
        .from('raw_signals')
        .update({
          status: 'discarded',
          metadata: {
            ...(signal.metadata ?? {}),
            discard_reason: 'not_a_saas_opportunity',
            filtered_by: 'classifier',
          },
        })
        .eq('id', signal.id)
    }
  }

  const estimatedCost = estimateCost(MODELS.CLASSIFIER, totalInput, totalOutput)

  console.log(
    `[Classifier] ${signals.length} reçus → ${discarded.length} rejetés | ` +
    `tokens: ${totalInput}in/${totalOutput}out | coût: $${estimatedCost.toFixed(5)}`
  )

  return {
    passed,
    discarded,
    usage: {
      input_tokens: totalInput,
      output_tokens: totalOutput,
      estimated_cost_usd: estimatedCost,
    },
  }
}
