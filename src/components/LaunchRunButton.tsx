'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const SCRAPING_STEPS = [
  'Initialisation des collecteurs...',
  'Scraping Hacker News & Reddit...',
  'Collecte des offres d\'emploi (LinkedIn, Indeed, France Travail)...',
  'Collecte des missions freelance (Upwork, Malt)...',
  'Collecte des données startups (Wellfound, G2)...',
  'Analyse IA des signaux par batch Gemini...',
  'Fusion et déduplication des opportunités...',
  'Calcul des scores de pertinence...',
]

interface LaunchRunButtonProps {
  label?: string
  icon?: React.ReactNode
  className?: string
}

type RunState = 'idle' | 'loading' | 'success' | 'error'

export default function LaunchRunButton({ label = 'Démarrer une nouvelle analyse', icon, className }: LaunchRunButtonProps) {
  const [state, setState] = useState<RunState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (state !== 'loading') return
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % SCRAPING_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [state])

  async function handleClick() {
    setState('loading')
    setMessage(null)
    setStepIndex(0)
    try {
      const res = await fetch('/api/scraping/run', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      const collected = data.collection?.signalsCollected ?? 0
      setMessage(`Collecte terminée — ${collected} signaux collectés`)
      setState('success')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur lors du lancement')
      setState('error')
    } finally {
      setTimeout(() => {
        setState('idle')
        setMessage(null)
      }, 4000)
    }
  }

  const isLoading = state === 'loading'

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-3 font-bold text-[10px] uppercase tracking-widest rounded-none transition shadow-md disabled:cursor-not-allowed
          ${state === 'success' ? 'bg-emerald-600 text-white border border-emerald-600' :
            state === 'error' ? 'bg-rose-600 text-white border border-rose-600' :
            'bg-[#2b3652] text-white hover:bg-[#1f283d]'}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon ?? null
        )}
        {isLoading ? 'Analyse en cours...' : label}
      </button>
      {isLoading && (
        <p className="mt-2 text-[10px] font-medium text-slate-500 animate-pulse">
          {SCRAPING_STEPS[stepIndex]}
        </p>
      )}
      {message && !isLoading && (
        <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${state === 'error' ? 'text-rose-500' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
