import {
  ArrowLeft, BrainCircuit, Calendar, FileText,
  BarChart3, Users, Sword, Star, Lightbulb, User
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { ReportSection } from '@/types/database'
import ReportContent from '@/components/ReportContent'
import PrintButton from '@/components/PrintButton'

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <FileText className="w-5 h-5" />,
  2: <BarChart3 className="w-5 h-5" />,
  3: <Users className="w-5 h-5" />,
  4: <Sword className="w-5 h-5" />,
  5: <Star className="w-5 h-5" />,
  6: <Lightbulb className="w-5 h-5" />,
}

export default async function FullReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: report } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('id', id)
    .eq('type', 'full')
    .maybeSingle()

  if (!report) notFound()

  const sections = (report.sections as ReportSection[])
    .sort((a, b) => a.order - b.order)
    .map(s => ({
      ...s,
      content: typeof s.content === 'string' ? s.content : String(s.content ?? ''),
    }))
  const params_ = report.generation_params as Record<string, unknown> | null

  // Section 6 contient "Pour toi" en fin de contenu — on l'affiche différemment
  const mainSections = sections.filter(s => s.order < 6)
  const lastSection = sections.find(s => s.order === 6)

  return (
    <div className="max-w-[1200px] mx-auto pb-20 print:max-w-full">

      {/* Navigation */}
      <div className="mb-10 print:hidden">
        <Link href="/reports" className="inline-flex items-center text-slate-400 hover:text-[#2b3652] font-bold text-xs uppercase tracking-widest transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux Rapports
        </Link>
      </div>

      {/* Header premium */}
      <div className="bg-[#2b3652] text-white p-12 mb-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#00b4d8] opacity-10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] mb-3 block">
                Global Intelligence Report
              </span>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">{report.title}</h1>
            </div>
            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">
              Complété
            </span>
          </div>

          <div className="flex items-center gap-8 mt-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Généré le</p>
                <p className="font-bold text-white/80 text-sm">
                  {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-4 h-4 text-[#00b4d8]" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Opportunités analysées</p>
                <p className="font-bold text-white/80 text-sm">{String(params_?.total_opportunities ?? '—')}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Signaux</p>
                <p className="font-bold text-white/80 text-sm">{String(params_?.total_signals ?? '—')}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-4 h-4 text-[#00b4d8]" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sections</p>
                <p className="font-bold text-white/80 text-sm">{sections.length} / 6</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Contenu principal */}
        <div className="col-span-12 xl:col-span-8">
          <div className="space-y-6">
            {mainSections.map(section => (
              <div key={section.order} id={`section-${section.order}`} className="bg-white border border-slate-200 p-10 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 bg-[#2b3652] text-white flex items-center justify-center shrink-0">
                    {SECTION_ICONS[section.order] ?? <FileText className="w-4 h-4" />}
                  </div>
                  <h2 className="text-xl font-black text-[#2b3652]">{section.title}</h2>
                </div>
                <ReportContent content={section.content} />
              </div>
            ))}

            {/* Section finale — recommandation + Pour toi */}
            {lastSection && (
              <div id={`section-6`} className="scroll-mt-8">
                {/* Recommandation principale */}
                <div className="bg-white border border-slate-200 p-10 mb-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 bg-[#2b3652] text-white flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-[#2b3652]">{lastSection.title}</h2>
                  </div>
                  <ReportContent content={lastSection.content} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar TOC */}
        <div className="col-span-12 xl:col-span-4 print:hidden">
          <div className="sticky top-8 space-y-4">
            <div className="bg-white border border-slate-200 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Table des matières</p>
              <nav className="space-y-1">
                {sections.map(section => (
                  <a
                    key={section.order}
                    href={`#section-${section.order}`}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition hover:bg-slate-50 ${
                      section.order === 6
                        ? 'text-[#00b4d8]'
                        : 'text-slate-600 hover:text-[#2b3652]'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-black shrink-0 ${
                      section.order === 6 ? 'bg-[#00b4d8] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {section.order}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
            <PrintButton />
          </div>
        </div>

      </div>
    </div>
  )
}
