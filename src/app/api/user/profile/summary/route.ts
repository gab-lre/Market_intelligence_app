// POST /api/user/profile/summary
// Génère un résumé en langage naturel du profil utilisateur via Gemini
// Body : { userId: string }

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function buildProfileSummaryPrompt(profile: UserProfile): string {
  const stageMap: Record<string, string> = {
    exploration: "en phase d'exploration d'idée",
    validation: "en phase de validation",
    building: "en train de construire son produit",
    launched: "déjà lancé",
  }
  const techMap: Record<string, string> = {
    non_tech: "non-technique",
    low_code: "low-code / no-code",
    junior_dev: "développeur junior",
    senior_dev: "développeur confirmé",
  }
  const budgetMap: Record<string, string> = {
    bootstrapped: "bootstrapped serré (< 1 000€)",
    few_thousands: "quelques milliers d'euros disponibles",
    comfortable: "budget confortable (> 5 000€)",
  }
  const horizonMap: Record<string, string> = {
    short: "moins de 6 mois",
    medium: "6 à 24 mois",
    long: "plus de 2 ans",
  }
  const marketMap: Record<string, string> = {
    fr: "le marché français",
    fr_qc: "le marché francophone (France + Québec)",
    europe: "le marché européen",
    international: "le marché international",
  }

  const parts: string[] = []

  if (profile.entrepreneurial_stage) {
    parts.push(`L'utilisateur est ${stageMap[profile.entrepreneurial_stage] ?? profile.entrepreneurial_stage}.`)
  }
  if (profile.tech_level) {
    parts.push(`Son niveau technique : ${techMap[profile.tech_level] ?? profile.tech_level}.`)
  }
  if (profile.secondary_skills?.length) {
    parts.push(`Compétences secondaires : ${profile.secondary_skills.join(', ')}.`)
  }
  if (profile.spoken_languages?.length) {
    parts.push(`Langues parlées : ${profile.spoken_languages.join(', ')}.`)
  }
  if (profile.weekly_availability) {
    const availMap: Record<string, string> = { few_hours: "quelques heures/semaine", half_time: "mi-temps", full_time: "plein temps" }
    parts.push(`Disponibilité : ${availMap[profile.weekly_availability] ?? profile.weekly_availability}.`)
  }
  if (profile.budget_range) {
    parts.push(`Budget : ${budgetMap[profile.budget_range] ?? profile.budget_range}.`)
  }
  if (profile.time_horizon) {
    parts.push(`Horizon temporel : ${horizonMap[profile.time_horizon] ?? profile.time_horizon}.`)
  }
  if (profile.preferred_business_models?.length) {
    parts.push(`Modèles business préférés : ${profile.preferred_business_models.join(', ')}.`)
  }
  if (profile.excluded_sectors?.length) {
    parts.push(`Secteurs à éviter : ${profile.excluded_sectors.join(', ')}.`)
  }
  if (profile.preferred_sectors?.length) {
    parts.push(`Secteurs d'affinité : ${profile.preferred_sectors.join(', ')}.`)
  }
  if (profile.priority_market) {
    parts.push(`Marché prioritaire : ${marketMap[profile.priority_market] ?? profile.priority_market}.`)
  }
  if (profile.preferred_target) {
    const targetMap: Record<string, string> = { sme: "TPE/PME", enterprise: "grandes entreprises", freelancers: "indépendants", consumers: "consommateurs" }
    parts.push(`Cible préférée : ${targetMap[profile.preferred_target] ?? profile.preferred_target}.`)
  }
  if (profile.existing_sector_knowledge) {
    parts.push(`Connaissance sectorielle : ${profile.existing_sector_knowledge}.`)
  }

  return `Tu es un expert en entrepreneuriat. À partir des informations suivantes, rédige un résumé concis et naturel du profil entrepreneurial de l'utilisateur, en 2-3 phrases maximum, à la 2ème personne du singulier (tutoiement). Le résumé doit être percutant, personnel et donner envie d'être lu. Ne commence pas par "Tu es".

Informations :
${parts.join('\n')}

Réponds uniquement avec le texte du résumé, sans guillemets ni formatage.`
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    const prompt = buildProfileSummaryPrompt(profile as UserProfile)

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const summary = result.response.text().trim()

    // Sauvegarder le résumé en base
    await supabase
      .from('user_profiles')
      .update({ profile_summary: summary, updated_at: new Date().toISOString() })
      .eq('id', userId)

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('[POST /api/user/profile/summary]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
