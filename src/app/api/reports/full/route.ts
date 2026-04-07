// POST /api/reports/full
// Génère un rapport d'intelligence marché complet (6 sections, plusieurs appels Gemini)
// Body : { userId?: string }

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import {
  FULL_REPORT_SYSTEM_PROMPT,
  buildFullReportSectionPrompt,
} from '@/lib/ai/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SECTION_TITLES: Record<number, string> = {
  1: 'Executive Summary',
  2: 'État du Marché & Cartographie Sectorielle',
  3: 'Analyse Emploi & Voix des Utilisateurs',
  4: 'Analyse Concurrentielle',
  5: 'Top Opportunités Personnalisées',
  6: 'Ce qu\'il Faudrait Construire en Premier',
}

function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned) as T
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body as { userId?: string }

    // 1. Profil utilisateur
    let profileSummary: string | null = null
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_summary')
        .eq('id', userId)
        .maybeSingle()
      profileSummary = profile?.profile_summary ?? null
    }

    // 2. Récupérer toutes les opportunités actives
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('title, score_global, department, opportunity_type, target_market, complexity')
      .eq('status', 'active')
      .order('score_global', { ascending: false })
      .limit(50)

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json(
        { error: 'Aucune opportunité disponible. Lancez d\'abord une collecte et une analyse.' },
        { status: 422 }
      )
    }

    // 3. Statistiques signaux par catégorie
    const { data: signalStats } = await supabase
      .from('raw_signals')
      .select('source_type')

    const signalsByCategory: Record<string, number> = {}
    for (const s of signalStats ?? []) {
      const cat = s.source_type === 'community' || s.source_type === 'review' ? 'community'
        : s.source_type === 'job' || s.source_type === 'freelance' ? 'job'
        : 'startup'
      signalsByCategory[cat] = (signalsByCategory[cat] ?? 0) + 1
    }
    const totalSignals = signalStats?.length ?? 0

    // 4. Distribution par département
    const departmentDistribution: Record<string, number> = {}
    for (const opp of opportunities) {
      const dept = opp.department ?? 'autre'
      departmentDistribution[dept] = (departmentDistribution[dept] ?? 0) + 1
    }

    // 5. Créer le rapport en statut "generating" pour tracking
    const { data: reportRow, error: createError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: userId ?? null,
        type: 'full',
        title: 'Global Intelligence Report',
        sections: [],
        sources_used: ['community', 'job', 'startup'],
        status: 'generating',
        sections_total: 6,
        sections_done: 0,
        generation_params: {
          total_signals: totalSignals,
          total_opportunities: opportunities.length,
        },
      })
      .select('id')
      .single()

    if (createError || !reportRow) {
      return NextResponse.json({ error: 'Erreur création rapport' }, { status: 500 })
    }

    const reportId = reportRow.id
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: FULL_REPORT_SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 8192 },
    })

    const params = {
      totalSignals,
      totalOpportunities: opportunities.length,
      opportunities: opportunities as Array<{
        title: string; score_global: number; department: string | null;
        opportunity_type: string; target_market: string | null; complexity: string | null
      }>,
      signalsByCategory,
      departmentDistribution,
      profileSummary,
    }

    // 6. Générer les 6 sections séquentiellement
    const sections: Array<{ order: number; title: string; content: string }> = []

    for (let i = 1; i <= 6; i++) {
      try {
        const prompt = buildFullReportSectionPrompt(i, params)
        const result = await model.generateContent(prompt)
        const rawText = result.response.text()

        type SectionData = { title: string; content: unknown }
        const sectionData = parseJsonResponse<SectionData>(rawText)

        const rawContent = sectionData.content
        let content: string
        if (typeof rawContent === 'string') {
          content = rawContent
        } else if (Array.isArray(rawContent)) {
          content = (rawContent as Array<Record<string, unknown>>)
            .map((item, idx) => {
              if (typeof item === 'string') return item
              const parts: string[] = []
              if (item.title) parts.push(`### ${idx + 1}. ${item.title}`)
              Object.entries(item).forEach(([k, v]) => {
                if (k !== 'title' && v != null) parts.push(`**${k}** : ${v}`)
              })
              return parts.join('\n')
            })
            .join('\n\n')
        } else {
          content = String(rawContent ?? '')
        }

        sections.push({ order: i, title: sectionData.title as string, content })

        // Mise à jour du compteur de progression
        await supabase
          .from('generated_reports')
          .update({ sections_done: i, sections })
          .eq('id', reportId)

      } catch (sectionErr) {
        console.error(`[FullReport] Erreur section ${i}:`, sectionErr)
        sections.push({
          order: i,
          title: SECTION_TITLES[i] ?? `Section ${i}`,
          content: `Cette section n'a pas pu être générée : ${(sectionErr as Error).message}`,
        })
      }
    }

    // 7. Finaliser le rapport
    await supabase
      .from('generated_reports')
      .update({
        sections,
        status: 'completed',
        sections_done: 6,
      })
      .eq('id', reportId)

    return NextResponse.json({ reportId })
  } catch (err) {
    console.error('[POST /api/reports/full]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
