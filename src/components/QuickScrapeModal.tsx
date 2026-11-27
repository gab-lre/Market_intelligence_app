'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Briefcase, Users, Rocket, Star, Globe, Database,
  ArrowRight, Loader2, ChevronLeft,
} from 'lucide-react'
import { startCollection } from '@/lib/actions'

type ScrapeType = 'category' | 'full'
type CategoryKey = 'job' | 'community' | 'reviews' | 'startup'

const CATEGORIES: { key: CategoryKey; label: string; desc: string; icon: React.ReactNode; sources: string[] }[] = [
  {
    key: 'job',
    label: 'Emplois & Missions Freelance',
    desc: 'LinkedIn, Indeed, Upwork, France Travail',
    icon: <Briefcase className="w-5 h-5 text-[#257b57]" />,
    sources: ['linkedin', 'indeed', 'upwork', 'francetravail']
  },
  {
    key: 'community',
    label: 'Communautés & Insights',
    desc: 'Dev.to, Reddit, Hacker News, Product Hunt',
    icon: <Users className="w-5 h-5 text-[#257b57]" />,
    sources: ['hackernews', 'reddit', 'devto', 'producthunt']
  },
  {
    key: 'reviews',
    label: 'Avis & Reviews Logiciels',
    desc: 'G2, Trustpilot, Capterra',
    icon: <Star className="w-5 h-5 text-[#257b57]" />,
    sources: ['g2', 'trustpilot', 'capterra']
  },
  {
    key: 'startup',
    label: 'Écosystème Startups',
    desc: 'Wellfound',
    icon: <Rocket className="w-5 h-5 text-[#257b57]" />,
    sources: ['wellfound']
  },
]

const SCRAPE_TYPES: {
  key: ScrapeType
  label: string
  desc: string
  icon: React.ReactNode
  tag?: string
}[] = [
  {
    key: 'category',
    label: 'Collecte par catégorie',
    desc: 'Cible une catégorie spécifique pour un scraping rapide et précis. Économise vos crédits.',
    icon: <Database className="w-6 h-6 text-[#257b57]" />,
  },
  {
    key: 'full',
    label: 'Collecte globale',
    desc: 'Lance tous les collecteurs disponibles. Idéal pour une couverture exhaustive.',
    icon: <Globe className="w-6 h-6 text-[#257b57]" />,
    tag: 'Recommandé',
  },
]

const SCRAPING_STEPS = [
  'Initialisation des collecteurs...',
  'Collecte des données sur les différentes sources...',
  'Filtrage et nettoyage des données brutes...',
  'Analyse IA des signaux par batch avec Gemini...',
  'Fusion et déduplication des opportunités...',
  'Calcul des scores de pertinence...',
  'Enregistrement dans la base de données...',
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function QuickScrapeModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [scrapeType, setScrapeType] = useState<ScrapeType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setScrapeType(null)
        setSelectedCategory(null)
        setLoading(false)
        setError(null)
        setSuccessMsg(null)
        setStepIndex(0)
      }, 300)
    }
  }, [isOpen])

  // Step cycling while loading
  useEffect(() => {
    if (!loading && !successMsg) return
    if (successMsg) return // Stop animating steps if done

    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % SCRAPING_STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [loading, successMsg])

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  const handleTypeSelect = (type: ScrapeType) => {
    setScrapeType(type)
    setStep(2)
  }

  const canLaunch = () => {
    if (!scrapeType) return false
    if (scrapeType === 'category') return selectedCategory !== null
    return true // full
  }

  const handleLaunch = async () => {
    if (!scrapeType || !canLaunch()) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    setStepIndex(0)

    try {
      const sources = scrapeType === 'category'
        ? CATEGORIES.find(c => c.key === selectedCategory)?.sources
        : undefined
      const { signalsCollected: collected } = await startCollection(sources)
      setSuccessMsg(`Collecte terminée — ${collected} signaux analysés et stockés.`)
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        // Refresh the page to update stats
        router.refresh()
      }, 3000)

    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1C1E]/50"
        onClick={(!loading && !successMsg) ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-[540px] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-[24px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step === 2 && scrapeType !== 'full' && (
              <button
                onClick={() => { setStep(1); setSelectedCategory(null); }}
                disabled={loading || !!successMsg}
                className="w-8 h-8 flex items-center justify-center text-[#707478] hover:text-[#1A1C1E] transition disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#257b57] mb-0.5">
                {step === 1 ? 'Étape 1 / 2' : scrapeType === 'full' ? 'Prêt à collecter' : 'Étape 2 / 2'}
              </p>
              <h2 className="text-lg font-black text-[#1A1C1E] leading-tight">
                {step === 1 ? 'Lancer une collecte' :
                  scrapeType === 'category' ? 'Choisir la catégorie' :
                  'Collecte Globale IA'}
              </h2>
            </div>
          </div>
          {(!loading && !successMsg) && (
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-[#707478] hover:text-[#1A1C1E] hover:bg-slate-100 transition rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6">

          {/* Step 1 — Pick type */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {SCRAPE_TYPES.map(st => (
                <button
                  key={st.key}
                  onClick={() => handleTypeSelect(st.key)}
                  className="flex items-start gap-4 p-5 border border-slate-200 text-left hover:border-[#257b57] hover:bg-[#F4F6F8] transition group rounded-2xl"
                >
                  <div className="w-10 h-10 bg-[#F4F6F8] group-hover:bg-white flex items-center justify-center shrink-0 transition rounded-full">
                    {st.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-[#1A1C1E] text-sm">{st.label}</span>
                      {st.tag && (
                        <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#257b57] text-[9px] font-black tracking-widest uppercase border border-[#257b57]/20 rounded-full">
                          {st.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#707478] font-medium leading-relaxed">{st.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#707478] group-hover:text-[#257b57] shrink-0 mt-1 transition" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Category target */}
          {step === 2 && scrapeType === 'category' && (
            <div className="flex flex-col gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  disabled={loading || !!successMsg}
                  className={`flex items-center gap-4 p-5 border text-left transition rounded-2xl ${
                    selectedCategory === cat.key
                      ? 'border-[#257b57] bg-[#E6F4EA]/50'
                      : 'border-slate-200 hover:border-[#257b57]/50 hover:bg-[#F4F6F8]'
                  } disabled:opacity-50`}
                >
                  <div className="w-10 h-10 bg-[#F4F6F8] flex items-center justify-center shrink-0 rounded-full">
                    {cat.icon}
                  </div>
                  <div>
                    <p className="font-black text-[#1A1C1E] text-sm mb-0.5">{cat.label}</p>
                    <p className="text-xs text-[#707478] font-medium">{cat.desc}</p>
                  </div>
                  {selectedCategory === cat.key && (
                    <div className="ml-auto w-5 h-5 bg-[#257b57] flex items-center justify-center shrink-0 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Full report: confirmation card */}
          {step === 2 && scrapeType === 'full' && (
            <div className="bg-[#1A1C1E] text-white p-6 relative overflow-hidden rounded-2xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#257b57] opacity-20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center mb-4 rounded-full">
                  <Globe className="w-6 h-6 text-[#257b57]" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Collecte de Données Globale</h3>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  Lance tous les scraper en parallèle, consolide tous les signaux récents à travers les plateformes communautaires, d'emplois, et annuaires startups pour une analyse marché ultra-complète via Gemini.
                </p>
                <p className="text-white/40 text-xs font-bold mt-3 uppercase tracking-widest">Durée estimée : ~4 minutes</p>
              </div>
            </div>
          )}

          {/* Progress & Success messages */}
          {loading && !successMsg && (
            <div className="mt-5 flex items-center gap-3 p-4 bg-[#F4F6F8] rounded-xl border border-slate-200">
              <Loader2 className="w-4 h-4 text-[#257b57] animate-spin shrink-0" />
              <p className="text-xs font-medium text-[#1A1C1E] animate-pulse">
                {SCRAPING_STEPS[stepIndex]}
              </p>
            </div>
          )}

          {successMsg && (
            <div className="mt-5 flex items-center gap-3 p-4 bg-[#E6F4EA] rounded-xl border border-[#257b57]/20">
              <div className="w-6 h-6 rounded-full bg-[#257b57] text-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-xs font-bold text-[#257b57]">
                {successMsg}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="px-8 pb-8">
            <button
              onClick={handleLaunch}
              disabled={loading || !canLaunch() || !!successMsg}
              className="w-full py-4 bg-[#1A1C1E] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...</>
              ) : successMsg ? (
                <>Terminé ✓</>
              ) : (
                <>Lancer la collecte <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
