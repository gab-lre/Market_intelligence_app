'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { key: 'job', label: 'Emplois & Missions Freelance' },
  { key: 'community', label: 'Communautés & Insights' },
  { key: 'startup', label: 'Écosystème Startups' },
]

const STEPS = [
  'Chargement des signaux multi-sources...',
  'Analyse croisée par catégorie...',
  'Détection des convergences et divergences...',
  'Rédaction du rapport IA...',
  'Finalisation...',
]

export default function CrossReportBuilder() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
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

  const toggle = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const canGenerate = selected.length >= 2

  const handleGenerate = async () => {
    if (!canGenerate) return
    setLoading(true)
    setError(null)
    setStepIndex(0)
    try {
      const userId = localStorage.getItem('mi_user_id') ?? undefined
      const res = await fetch('/api/reports/cross', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selected, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      router.push(`/reports/cross/${data.reportId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {CATEGORIES.map(cat => (
          <label
            key={cat.key}
            className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition ${
              selected.includes(cat.key)
                ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(cat.key)}
              onChange={() => toggle(cat.key)}
              className="mt-1 accent-[#00b4d8]"
            />
            <span className="text-xs font-black text-[#2b3652] uppercase tracking-wider">{cat.label}</span>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mb-4">{error}</p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-6 flex-wrap gap-3">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            {selected.length === 0
              ? 'Sélectionnez au moins 2 catégories'
              : selected.length === 1
              ? 'Sélectionnez une catégorie supplémentaire'
              : `${selected.length} catégories sélectionnées`}
          </p>
          {loading && (
            <p className="text-[10px] font-medium text-slate-500 animate-pulse mt-1">
              {STEPS[stepIndex]}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#2b3652] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#1e2840] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
          ) : (
            <>Générer Vue Croisée <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}
