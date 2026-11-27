import {
  ArrowLeft, BrainCircuit, Calendar, FileText,
  BarChart3, Users, Sword, Star, Lightbulb, User
} from 'lucide-react'
import Link from 'next/link'
import { getReport } from '@/lib/data'
import { notFound } from 'next/navigation'
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

  const report = await getReport(id, 'full')

  if (!report) notFound()

  const sections = report.sections
  const params_ = report.stats

  // Section 6 contient "Pour toi" en fin de contenu — on l'affiche différemment
  const mainSections = sections.filter(s => s.order < 6)
  const lastSection = sections.find(s => s.order === 6)

  return (
    <div className="w-full flex-1 pb-20">

      {/* Navigation */}
      <div className="mb-10 print:hidden">
        <Link href="/reports" className="inline-flex items-center text-slate-400 hover:text-[#2b3652] font-bold text-xs uppercase tracking-widest transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux Rapports
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#257b57] block mb-2">
            Global Intelligence Report
          </span>
          <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight mb-2">
            {report.title}
          </h1>
        </div>
        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[12px] text-[10px] font-black uppercase tracking-widest">
          Complété
        </span>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Généré le</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">
              {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Opportunités analysées</p>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">{String(params_?.total_opportunities ?? '—')}</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Signaux</p>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">{String(params_?.total_signals ?? '—')}</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#F0F2F4]">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sections</p>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#257b57]" />
            <p className="font-bold text-sm text-[#1A1C1E]">{sections.length} / 6</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Contenu principal */}
        <div className="col-span-12 xl:col-span-8">
          <div className="space-y-6">
            {mainSections.map(section => (
              <div key={section.order} id={`section-${section.order}`} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#FAFBFC] border border-[#F0F2F4] text-[#1A1C1E] flex items-center justify-center shrink-0">
                    {SECTION_ICONS[section.order] ?? <FileText className="w-4 h-4" />}
                  </div>
                  <h2 className="text-xl font-black text-[#1A1C1E]">{section.title}</h2>
                </div>
                <ReportContent content={section.content} />
              </div>
            ))}

            {/* Section finale — recommandation + Pour toi */}
            {lastSection && (
              <div id={`section-6`} className="scroll-mt-8">
                {/* Recommandation principale */}
                <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 mb-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-[#FAFBFC] border border-[#F0F2F4] text-[#1A1C1E] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-[#1A1C1E]">{lastSection.title}</h2>
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
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Table des matières</p>
              <nav className="space-y-1">
                {sections.map(section => (
                  <a
                    key={section.order}
                    href={`#section-${section.order}`}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition rounded-[12px] hover:bg-slate-50 ${
                      section.order === 6
                        ? 'text-[#257b57]'
                        : 'text-slate-600 hover:text-[#1A1C1E]'
                    }`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-black shrink-0 rounded-full ${
                      section.order === 6 ? 'bg-[#E6F4EA] text-[#257b57]' : 'bg-[#F4F6F8] text-[#707478]'
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
