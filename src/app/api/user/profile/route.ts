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
    main_motivation: [],
    secondary_skills: [],
    spoken_languages: [],
    preferred_business_models: [],
    excluded_sectors: [],
    preferred_sectors: [],
    preferred_solution_types: [],
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
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
