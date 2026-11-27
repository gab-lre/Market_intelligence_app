'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Globe, ArrowRight, Loader2, ChevronLeft, CheckSquare, Square,
} from 'lucide-react'
import { generateReport } from '@/lib/actions'
import {
  CATEGORIES, REPORT_TYPES, FULL_STEPS, CATEGORY_STEPS, CROSS_STEPS,
  type CategoryKey, type ReportType,
} from './reportModalOptions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function QuickReportModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([])
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setReportType(null)
        setSelectedCategory(null)
        setSelectedCategories([])
        setLoading(false)
        setError(null)
        setStepIndex(0)
      }, 300)
    }
  }, [isOpen])

  // Step cycling while loading
  useEffect(() => {
    if (!loading) return
    const steps = reportType === 'full' ? FULL_STEPS : reportType === 'cross' ? CROSS_STEPS : CATEGORY_STEPS
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % steps.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [loading, reportType])

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  const handleTypeSelect = (type: ReportType) => {
    setReportType(type)
    setStep(2)
  }

  const toggleCrossCategory = (key: CategoryKey) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const canGenerate = () => {
    if (!reportType) return false
    if (reportType === 'category') return selectedCategory !== null
    if (reportType === 'cross') return selectedCategories.length >= 2
    return true // full
  }

  const handleGenerate = async () => {
    if (!reportType || !canGenerate()) return
    setLoading(true)
    setError(null)
    setStepIndex(0)
    try {
      const { reportId } = await generateReport(reportType, {
        category: selectedCategory ?? undefined,
        categories: selectedCategories,
      })
      onClose()
      router.push(`/reports/${reportType}/${reportId}`)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const currentSteps = reportType === 'full' ? FULL_STEPS : reportType === 'cross' ? CROSS_STEPS : CATEGORY_STEPS

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1C1E]/50"
        onClick={!loading ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-[540px] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-[24px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step === 2 && reportType !== 'full' && (
              <button
                onClick={() => { setStep(1); setSelectedCategory(null); setSelectedCategories([]) }}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center text-[#707478] hover:text-[#1A1C1E] transition disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#257b57] mb-0.5">
                {step === 1 ? 'Étape 1 / 2' : reportType === 'full' ? 'Prêt à générer' : 'Étape 2 / 2'}
              </p>
              <h2 className="text-lg font-black text-[#1A1C1E] leading-tight">
                {step === 1 ? 'Choisir un type de rapport' :
                  reportType === 'category' ? 'Choisir la catégorie' :
                  reportType === 'cross' ? 'Sélectionner les catégories' :
                  'Rapport Global Intelligence'}
              </h2>
            </div>
          </div>
          {!loading && (
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
              {REPORT_TYPES.map(rt => (
                <button
                  key={rt.key}
                  onClick={() => handleTypeSelect(rt.key)}
                  className="flex items-start gap-4 p-5 border border-slate-200 text-left hover:border-[#257b57] hover:bg-[#F4F6F8] transition group rounded-2xl"
                >
                  <div className="w-10 h-10 bg-[#F4F6F8] group-hover:bg-white flex items-center justify-center shrink-0 transition rounded-full">
                    {rt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-[#1A1C1E] text-sm">{rt.label}</span>
                      {rt.tag && (
                        <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#257b57] text-[9px] font-black tracking-widest uppercase border border-[#257b57]/20 rounded-full">
                          {rt.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#707478] font-medium leading-relaxed">{rt.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#707478] group-hover:text-[#257b57] shrink-0 mt-1 transition" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Category report: pick one category */}
          {step === 2 && reportType === 'category' && (
            <div className="flex flex-col gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  disabled={loading}
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

          {/* Step 2 — Cross report: pick 2-3 categories */}
          {step === 2 && reportType === 'cross' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#707478] font-medium mb-2">
                Sélectionnez <span className="font-black text-[#1A1C1E]">2 ou 3 catégories</span> à croiser.
                {selectedCategories.length === 1 && <span className="text-orange-500"> — encore 1 minimum</span>}
                {selectedCategories.length >= 2 && <span className="text-[#257b57]"> — prêt à générer ✓</span>}
              </p>
              {CATEGORIES.map(cat => {
                const checked = selectedCategories.includes(cat.key)
                return (
                  <button
                    key={cat.key}
                    onClick={() => toggleCrossCategory(cat.key)}
                    disabled={loading}
                    className={`flex items-center gap-4 p-5 border text-left transition rounded-2xl ${
                      checked
                        ? 'border-[#257b57] bg-[#E6F4EA]/50'
                        : 'border-slate-200 hover:border-[#257b57]/50 hover:bg-[#F4F6F8]'
                    } disabled:opacity-50`}
                  >
                    <div className="shrink-0 text-slate-300">
                      {checked
                        ? <CheckSquare className="w-5 h-5 text-[#257b57]" />
                        : <Square className="w-5 h-5" />}
                    </div>
                    <div className="w-10 h-10 bg-[#F4F6F8] flex items-center justify-center shrink-0 rounded-full">
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-black text-[#1A1C1E] text-sm mb-0.5">{cat.label}</p>
                      <p className="text-xs text-[#707478] font-medium">{cat.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2 — Full report: confirmation card */}
          {step === 2 && reportType === 'full' && (
            <div className="bg-[#1A1C1E] text-white p-6 relative overflow-hidden rounded-2xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#257b57] opacity-20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center mb-4 rounded-full">
                  <Globe className="w-6 h-6 text-[#257b57]" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Global Intelligence Report</h3>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  Fusionne toutes les sources. 6 sections structurées : executive summary, cartographie marché, analyse emploi, analyse communautés, concurrentielle, top opportunités.
                </p>
                <p className="text-white/40 text-xs font-bold mt-3 uppercase tracking-widest">Durée estimée : ~3 minutes</p>
              </div>
            </div>
          )}

          {/* Progress steps while loading */}
          {loading && (
            <div className="mt-5 flex items-center gap-3 p-4 bg-[#F4F6F8] rounded-xl border border-slate-200">
              <Loader2 className="w-4 h-4 text-[#257b57] animate-spin shrink-0" />
              <p className="text-xs font-medium text-[#1A1C1E] animate-pulse">
                {currentSteps[stepIndex]}
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
              onClick={handleGenerate}
              disabled={loading || !canGenerate()}
              className="w-full py-4 bg-[#1A1C1E] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
              ) : (
                <>Générer le rapport <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
