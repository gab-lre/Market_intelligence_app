'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

const GENERATION_STEPS = [
  'Analyse de toutes les sources...',
  'Génération de l\'executive summary...',
  'Cartographie du marché...',
  'Analyse emploi & communautés...',
  'Analyse concurrentielle...',
  'Personnalisation selon votre profil...',
]

export default function FullReportButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % GENERATION_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [loading])

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setStepIndex(0)
    try {
      const userId = localStorage.getItem('mi_user_id') ?? undefined
      const res = await fetch('/api/reports/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      router.push(`/reports/full/${data.reportId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-3 bg-white text-[#2b3652] px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-[#00b4d8] hover:text-white transition-all shadow-md disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> En cours...</>
        ) : (
          <>Générer le rapport <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
      {loading && (
        <p className="text-white/50 text-xs font-medium mt-3 animate-pulse">
          {GENERATION_STEPS[stepIndex]}
        </p>
      )}
      {error && (
        <p className="text-red-300 text-xs font-medium mt-3">{error}</p>
      )}
    </div>
  )
}
