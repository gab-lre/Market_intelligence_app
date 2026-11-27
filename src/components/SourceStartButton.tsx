'use client'

import { useState } from 'react'
import { PlayCircle, Loader2 } from 'lucide-react'
import { startCollection } from '@/lib/actions'

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
      await startCollection(sourceNames)
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
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-[#F0F2F4] text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-[16px] cursor-not-allowed"
      >
        <PlayCircle className="w-3.5 h-3.5" />
        Non disponible
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`flex items-center justify-center gap-2 py-2 px-4 text-[10px] font-black uppercase tracking-widest rounded-[16px] transition-all disabled:cursor-not-allowed
        ${state === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' :
          state === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-600' :
          'bg-[#1A1C1E] border border-[#1A1C1E] text-white hover:bg-black hover:border-black shadow-[0_4px_20px_rgba(0,0,0,0.08)]'}`}
    >
      {state === 'loading' ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <PlayCircle className="w-3.5 h-3.5" />
      )}
      {state === 'loading' ? 'En cours...' : state === 'success' ? 'Terminé' : state === 'error' ? 'Erreur' : (label || 'Démarrer')}
    </button>
  )
}
