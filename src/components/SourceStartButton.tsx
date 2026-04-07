'use client'

import { useState } from 'react'
import { PlayCircle, Loader2 } from 'lucide-react'

interface SourceStartButtonProps {
  sourceNames: string[]
  label?: string
  disabled?: boolean
}

type BtnState = 'idle' | 'loading' | 'success' | 'error'

export default function SourceStartButton({ sourceNames, label, disabled }: SourceStartButtonProps) {
  const [state, setState] = useState<BtnState>('idle')

  async function handleClick() {
    if (disabled || state === 'loading' || sourceNames.length === 0) return
    setState('loading')
    try {
      const res = await fetch('/api/scraping/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: sourceNames.map(s => ({ source: s })) }),
      })
      if (!res.ok) throw new Error('Erreur')
      setState('success')
    } catch {
      setState('error')
    } finally {
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-100 text-slate-300 text-xs font-black uppercase tracking-widest rounded-none cursor-not-allowed"
      >
        <PlayCircle className="w-4 h-4" />
        Non disponible
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`flex items-center justify-center gap-2 py-2.5 px-6 bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-none transition shadow-sm disabled:cursor-not-allowed
        ${state === 'success' ? 'border-[#00b4d8] text-[#00b4d8]' :
          state === 'error' ? 'border-rose-400 text-rose-500' :
          'text-slate-600 hover:bg-[#2b3652] hover:text-white hover:border-[#2b3652]'}`}
    >
      {state === 'loading' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <PlayCircle className="w-4 h-4" />
      )}
      {state === 'loading' ? 'En cours...' : state === 'success' ? 'Terminé' : state === 'error' ? 'Erreur' : (label || 'Démarrer')}
    </button>
  )
}
