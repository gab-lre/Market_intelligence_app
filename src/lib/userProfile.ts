// Utilitaire — récupération du profil utilisateur unique
// Architecture single-user : on prend le premier profil onboarding_completed = true

import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('onboarding_completed', true)
    .limit(1)
    .single()
  return data ?? null
}
