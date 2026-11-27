'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { generateReport } from '@/lib/actions'

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
      const data = await generateReport('full')
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
        className="flex items-center gap-2 bg-white text-[#1A1C1E] px-6 py-3 rounded-xl font-bold text-[12px] hover:bg-[#257b57] hover:text-white transition-all shadow-md disabled:opacity-60 group"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> En cours...</>
        ) : (
          <><Sparkles className="w-4 h-4 text-[#257b57] group-hover:text-white transition-colors" /> Générer le rapport <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
      {loading && (
        <p className="text-white/60 text-[11px] font-medium mt-3 animate-pulse">
          {GENERATION_STEPS[stepIndex]}
        </p>
      )}
      {error && (
        <p className="text-red-300 text-xs font-medium mt-3">{error}</p>
      )}
    </div>
  )
}
