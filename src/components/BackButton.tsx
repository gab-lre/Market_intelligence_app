'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="text-sm font-medium text-slate-400 hover:text-[#2b3652] transition"
    >
      ← Retour
    </button>
  )
}
