'use client'

import { useState, useEffect } from 'react'
import { BrainCircuit, Loader2, ChevronRight } from 'lucide-react'
import { getPendingSignalsCount } from '@/lib/data'
import { runAnalysis } from '@/lib/actions'

type State = 'idle' | 'loading' | 'success' | 'error'

interface Result {
  analyzed: number
  created: number
  updated: number
  discarded: number
  pendingRemaining: number
}

export default function AnalyzePendingButton() {
  const [state, setState] = useState<State>('idle')
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  // Charger le nombre de signaux pending au montage
  useEffect(() => {
    getPendingSignalsCount()
      .then(setPendingCount)
      .catch(() => setPendingCount(null))
  }, [])

  async function handleClick() {
    if (state === 'loading') return
    setState('loading')
    setResult(null)
    try {
      const data = await runAnalysis(50)
      setResult(data)
      setPendingCount(data.pendingRemaining ?? 0)
      setState('success')
    } catch {
      setState('error')
    } finally {
      setTimeout(() => setState('idle'), 5000)
    }
  }

  if (pendingCount === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={state === 'loading'}
        className={`flex items-center justify-between p-2 pr-4 bg-white border border-[#F0F2F4] rounded-[24px] w-full text-left transition-all hover:border-[#E0E4E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] group disabled:opacity-50 disabled:cursor-not-allowed
          ${state === 'success' ? 'border-emerald-200 bg-emerald-50' :
            state === 'error' ? 'border-rose-200 bg-rose-50' : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${state === 'success' ? 'bg-emerald-100' : state === 'error' ? 'bg-rose-100' : 'bg-[#F4F6F8]'}`}>
            {state === 'loading' ? <Loader2 className="w-5 h-5 text-[#1A1C1E] animate-spin" /> : <BrainCircuit className={`w-5 h-5 ${state === 'success' ? 'text-emerald-600' : state === 'error' ? 'text-rose-600' : 'text-[#1A1C1E]'}`} />}
          </div>
          <div>
            <p className={`font-bold text-[14px] leading-tight mb-0.5 ${state === 'success' ? 'text-emerald-700' : state === 'error' ? 'text-rose-700' : 'text-[#1A1C1E]'}`}>
              {state === 'loading' ? 'Analyse en cours...' :
               state === 'success' ? 'Lot analysé ✓' :
               state === 'error' ? 'Erreur' :
               'Analyser les signaux'}
            </p>
            <p className={`text-[11px] font-medium leading-tight ${state === 'success' ? 'text-emerald-600/80' : state === 'error' ? 'text-rose-600/80' : 'text-[#707478]'}`}>
              {pendingCount !== null ? `${pendingCount} signaux en attente` : 'Lancer l\'IA'}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full border border-[#F0F2F4] flex items-center justify-center shrink-0 group-hover:bg-[#FAFBFC] transition-colors ml-2">
          <ChevronRight className="w-4 h-4 text-[#1A1C1E] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </button>
      {result && (
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          +{result.created} créées · {result.updated} fusionnées · {result.discarded} rejetées
          {result.pendingRemaining > 0 && ` · ${result.pendingRemaining} restants`}
        </p>
      )}
      {pendingCount !== null && pendingCount > 50 && state === 'idle' && (
        <p className="text-[10px] text-amber-600 font-medium">
          Traitement par lots de 50 — relancez jusqu'à épuisement
        </p>
      )}
    </div>
  )
}
