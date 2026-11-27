'use client'

import { useState, useEffect } from 'react'
import { Loader2, Database, ChevronRight } from 'lucide-react'
import { startCollection } from '@/lib/actions'

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
      const { signalsCollected: collected } = await startCollection()
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
        className={`flex items-center justify-between p-2 pr-6 bg-[#1A1C1E] rounded-[24px] w-full text-left transition-all hover:bg-black group disabled:opacity-50 disabled:cursor-not-allowed
          ${state === 'success' ? 'bg-emerald-600' :
            state === 'error' ? 'bg-rose-600' : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : (icon ?? <Database className="w-5 h-5 text-white" />)}
          </div>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight mb-0.5">
              {isLoading ? 'Collecte en cours...' : (state === 'success' ? 'Terminé' : state === 'error' ? 'Erreur' : label)}
            </p>
            <p className="text-white/60 text-[11px] font-medium leading-tight">
              Scraper de nouveaux signaux
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors ml-4">
          <ChevronRight className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
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
