'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full px-4 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:border-slate-400 transition print:hidden"
    >
      Exporter (PDF)
    </button>
  )
}
