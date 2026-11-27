'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Check } from 'lucide-react'
import { generateReport } from '@/lib/actions'

const CATEGORIES = [
  { key: 'job',       label: 'Emplois & Freelance',   emoji: '💼' },
  { key: 'community', label: 'Communautés & Insights', emoji: '👥' },
  { key: 'startup',   label: 'Écosystème Startups',   emoji: '🚀' },
]

const STEPS = [
  'Chargement des signaux multi-sources...',
  'Analyse croisée par catégorie...',
  'Détection des convergences...',
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
      const data = await generateReport('cross', { categories: selected })
      router.push(`/reports/cross/${data.reportId}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 mb-5">
        {CATEGORIES.map(cat => {
          const active = selected.includes(cat.key)
          return (
            <button
              key={cat.key}
              onClick={() => toggle(cat.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                active
                  ? 'border-[#257b57] bg-[#E6F4EA] text-[#1A1C1E]'
                  : 'border-[#F0F2F4] bg-[#FAFBFC] text-[#707478] hover:border-[#E0E0E0] hover:bg-white'
              }`}
            >
              <span className="text-lg shrink-0">{cat.emoji}</span>
              <span className="text-[13px] font-bold flex-1">{cat.label}</span>
              {active && (
                <span className="w-5 h-5 rounded-full bg-[#257b57] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[11px] font-medium text-[#A0A4A8]">
          {selected.length === 0
            ? 'Sélectionnez au moins 2 catégories'
            : selected.length === 1
            ? 'Sélectionnez une catégorie supplémentaire'
            : `${selected.length} catégories sélectionnées`}
        </p>

        {loading && (
          <p className="text-[10px] font-medium text-[#707478] animate-pulse">
            {STEPS[stepIndex]}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1C1E] text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Génération...</>
          ) : (
            <>Générer la vue croisée <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium mt-3">{error}</p>
      )}
    </div>
  )
}
