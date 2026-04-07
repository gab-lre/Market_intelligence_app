'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

const STEPS = [
  'Chargement des signaux de la catégorie...',
  'Sélection des signaux les plus pertinents...',
  'Analyse IA Gemini en cours...',
  'Structuration du rapport...',
  'Finalisation et mise en page...',
]

interface CategoryReportButtonProps {
  category: 'community' | 'job' | 'startup'
  label: string
}

export default function CategoryReportButton({ category, label }: CategoryReportButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [loading])

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setStepIndex(0)
    try {
      const userId = localStorage.getItem('mi_user_id') ?? undefined
      const res = await fetch('/api/reports/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      router.push(`/reports/category/${data.reportId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#2b3652] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#1e2840] transition disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
        ) : (
          <>Générer le rapport <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
      {loading && (
        <p className="text-[10px] font-medium text-slate-500 animate-pulse text-center">
          {STEPS[stepIndex]}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium text-center">{error}</p>
      )}
    </div>
  )
}
