'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Vérifie si l'onboarding a été complété (côté client via localStorage + API)
// Si non complété, redirige vers /onboarding
export default function OnboardingGate() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Ne pas rediriger si on est déjà sur l'onboarding ou les settings
    if (pathname === '/onboarding' || pathname.startsWith('/settings')) return

    async function check() {
      const userId = localStorage.getItem('mi_user_id')
      if (!userId) {
        router.push('/onboarding')
        return
      }

      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`)
        const data = await res.json()
        if (!data.profile || !data.profile.onboarding_completed) {
          router.push('/onboarding')
        }
      } catch {
        // En cas d'erreur réseau, on laisse passer (ne pas bloquer l'app)
      }
    }

    check()
  }, [pathname, router])

  return null
}
