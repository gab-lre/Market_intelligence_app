// GET  /api/user/profile?userId=<uuid>  — récupère le profil
// POST /api/user/profile                — crée un profil vide, retourne l'UUID
// PATCH /api/user/profile               — met à jour un profil existant

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { UserProfileInsert, UserProfileUpdate } from '@/types/database'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}

export async function POST() {
  // Crée un profil vide — l'UUID sera stocké en localStorage côté client
  const insert: UserProfileInsert = {
    onboarding_completed: false,
    onboarding_step: 0,
    // Bloc 1
    entrepreneurial_stage: null,
    main_motivation: [],
    time_horizon: null,
    prior_experience: null,
    // Bloc 2
    tech_level: null,
    secondary_skills: [],
    spoken_languages: [],
    weekly_availability: null,
    // Bloc 3
    budget_range: null,
    preferred_business_models: [],
    excluded_sectors: [],
    preferred_sectors: [],
    // Bloc 4
    preferred_solution_types: [],
    preferred_target: null,
    product_complexity: null,
    vertical_vs_horizontal: null,
    // Bloc 5
    priority_market: null,
    existing_sector_knowledge: null,
    // Bloc 6
    report_detail_level: null,
    report_tone: null,
    report_frequency: null,
    // IA
    profile_summary: null,
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(insert)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ userId: data.id })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { userId, ...updates } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  }

  const update: UserProfileUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(update)
    .eq('id', userId)
    .select('id, onboarding_step, onboarding_completed, profile_summary')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json({ profile: data })
}
