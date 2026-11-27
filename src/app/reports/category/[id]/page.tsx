import { ArrowLeft, BrainCircuit, Calendar, Tag, BookOpen, Lightbulb, AlertTriangle, Star, User } from 'lucide-react'
import Link from 'next/link'
import { getReport } from '@/lib/data'
import { notFound } from 'next/navigation'
import ReportContent from '@/components/ReportContent'
import PrintButton from '@/components/PrintButton'

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <BookOpen className="w-5 h-5" />,
  2: <BrainCircuit className="w-5 h-5" />,
  3: <Star className="w-5 h-5" />,
  4: <Lightbulb className="w-5 h-5" />,
  5: <AlertTriangle className="w-5 h-5" />,
  6: <User className="w-5 h-5" />,
}

export default async function CategoryReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const report = await getReport(id, 'category')

  if (!report) notFound()

  const sections = report.sections
  const params_ = report.stats
  const forYouSection = sections.find(s => s.order === 6)
  const mainSections = sections.filter(s => s.order !== 6)

  return (
    <div className="max-w-[1100px] mx-auto pb-20 print:max-w-full">

      {/* Navigation */}
      <div className="mb-10 print:hidden">
        <Link href="/reports" className="inline-flex items-center text-slate-400 hover:text-[#2b3652] font-bold text-xs uppercase tracking-widest transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux Rapports
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Colonne principale */}
        <div className="col-span-12 xl:col-span-8">

          {/* Header */}
          <div className="bg-white border border-slate-200 border-t-4 border-t-[#00b4d8] p-10 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Rapport par catégorie
                </span>
                <h1 className="text-3xl font-black text-[#2b3652] tracking-tight">{report.title}</h1>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
                Complété
              </span>
            </div>

            <div className="flex items-center gap-6 bg-[#f4f7fb] p-5 border border-slate-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Généré le</p>
                  <p className="font-bold text-sm text-[#2b3652]">
                    {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signaux analysés</p>
                  <p className="font-bold text-sm text-[#2b3652]">{String(params_?.signals_analyzed ?? '—')}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-4 h-4 text-[#00b4d8]" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moteur</p>
                  <p className="font-bold text-sm text-[#2b3652]">Gemini 2.5 Flash</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections principales */}
          <div className="space-y-6">
            {mainSections.map(section => (
              <div key={section.order} id={`section-${section.order}`} className="bg-white border border-slate-200 p-10 scroll-mt-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 bg-[#2b3652] text-white flex items-center justify-center shrink-0">
                    {SECTION_ICONS[section.order] ?? <BookOpen className="w-4 h-4" />}
                  </div>
                  <h2 className="text-xl font-black text-[#2b3652]">{section.title}</h2>
                </div>
                <ReportContent content={section.content} />
              </div>
            ))}
          </div>

          {/* Section "Pour toi" */}
          {forYouSection && (
            <div id="section-6" className="bg-[#2b3652] p-10 mt-6 scroll-mt-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                <div className="w-8 h-8 bg-[#00b4d8] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">{forYouSection.title}</h2>
              </div>
              <div className="text-white/80 leading-relaxed">
                <ReportContent content={forYouSection.content} dark />
              </div>
            </div>
          )}
        </div>

        {/* Table des matières */}
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
                        ? 'text-[#00b4d8] hover:text-[#00b4d8]'
                        : 'text-slate-600 hover:text-[#2b3652]'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-black shrink-0 ${
                      section.order === 6 ? 'bg-[#00b4d8] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {section.order}
                    </span>
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Bouton export print */}
            <PrintButton />
          </div>
        </div>

      </div>
    </div>
  )
}
