'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Sparkles } from 'lucide-react'

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
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#1A1C1E] text-white text-[11px] font-bold rounded-xl hover:bg-black transition-all disabled:opacity-60 shadow-sm group"
      >
        {loading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Génération...</>
        ) : (
          <><Sparkles className="w-3.5 h-3.5 text-[#257b57]" /> Générer le rapport <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
        )}
      </button>
      {loading && (
        <p className="text-[10px] font-medium text-[#707478] animate-pulse text-center">
          {STEPS[stepIndex]}
        </p>
      )}
      {error && (
        <p className="text-[10px] text-rose-500 font-medium text-center">{error}</p>
      )}
    </div>
  )
}
