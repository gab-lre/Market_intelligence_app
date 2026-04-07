// Composant d'affichage du contenu markdown simplifié des rapports
// Pas de dépendance externe — rendu basique du markdown utilisé par les prompts

interface ReportContentProps {
  content: string | null | undefined
  dark?: boolean
}

type Block =
  | { type: 'heading2'; text: string }
  | { type: 'heading3'; text: string }
  | { type: 'heading4'; text: string }
  | { type: 'spacer' }
  | { type: 'hr' }
  | { type: 'list'; items: string[] }
  | { type: 'numbered'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'paragraph'; text: string }

function parseBlocks(text: string | null | undefined): Block[] {
  if (!text || typeof text !== 'string') return []

  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading 2
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading2', text: line.slice(3) })
      i++
      continue
    }

    // Heading 3
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading3', text: line.slice(4) })
      i++
      continue
    }

    // Heading 4
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'heading4', text: line.slice(5) })
      i++
      continue
    }

    // Ligne vide
    if (line.trim() === '') {
      blocks.push({ type: 'spacer' })
      i++
      continue
    }

    // Séparateur
    if (line.trim() === '---') {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: line.slice(2) })
      i++
      continue
    }

    // Table — groupe toutes les lignes consécutives commençant par |
    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      const parseRow = (row: string): string[] =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())

      const isSeparator = (row: string) =>
        row.replace(/[|\s:-]/g, '').length === 0

      const dataLines = tableLines.filter((l) => !isSeparator(l))
      if (dataLines.length >= 1) {
        const headers = parseRow(dataLines[0])
        const rows = dataLines.slice(1).map(parseRow)
        blocks.push({ type: 'table', headers, rows })
      }
      continue
    }

    // Liste non-ordonnée — groupe les items consécutifs
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].replace(/^[-*] /, ''))
        i++
      }
      blocks.push({ type: 'list', items })
      continue
    }

    // Liste numérotée — groupe les items consécutifs
    const numberedMatch = line.match(/^(\d+)\. (.+)/)
    if (numberedMatch) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        const m = lines[i].match(/^\d+\. (.+)/)
        if (m) items.push(m[1])
        i++
      }
      blocks.push({ type: 'numbered', items })
      continue
    }

    // Paragraphe standard
    blocks.push({ type: 'paragraph', text: line })
    i++
  }

  return blocks
}

function InlineMarkdown({ text, dark }: { text: string; dark: boolean }) {
  const boldColor = dark ? 'text-white font-black' : 'text-[#2b3652] font-black'
  const italicColor = dark ? 'text-white/70' : 'text-slate-500'
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className={boldColor}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <em key={i} className={italicColor}>{part.slice(1, -1)}</em>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function ReportContent({ content, dark = false }: ReportContentProps) {
  const safeContent = typeof content === 'string' ? content : String(content ?? '')
  if (!safeContent) {
    return <p className={`text-sm italic ${dark ? 'text-white/40' : 'text-slate-400'}`}>Contenu indisponible pour cette section.</p>
  }

  const baseText = dark ? 'text-white/80' : 'text-slate-600'
  const headingColor = dark ? 'text-white' : 'text-[#2b3652]'
  const hrColor = dark ? 'border-white/10' : 'border-slate-200'
  const tableHead = dark ? 'bg-white/10 text-white text-xs uppercase tracking-widest' : 'bg-[#2b3652] text-white text-xs uppercase tracking-widest'
  const tableRow = dark ? 'border-white/10 text-white/80' : 'border-slate-100 text-slate-700'
  const tableRowAlt = dark ? 'bg-white/5' : 'bg-slate-50'
  const blockquoteBorder = dark ? 'border-[#00b4d8] text-white/70 bg-white/5' : 'border-[#00b4d8] text-slate-600 bg-slate-50'

  const blocks = parseBlocks(safeContent)

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading2':
            return (
              <h3 key={idx} className={`text-base font-black mt-8 mb-3 pb-2 border-b ${hrColor} ${headingColor}`}>
                <InlineMarkdown text={block.text} dark={dark} />
              </h3>
            )
          case 'heading3':
            return (
              <h4 key={idx} className={`text-sm font-black mt-5 mb-2 ${headingColor}`}>
                <InlineMarkdown text={block.text} dark={dark} />
              </h4>
            )
          case 'heading4':
            return (
              <h5 key={idx} className={`text-xs font-black uppercase tracking-wider mt-4 mb-1 ${dark ? 'text-white/70' : 'text-slate-500'}`}>
                <InlineMarkdown text={block.text} dark={dark} />
              </h5>
            )
          case 'spacer':
            return <div key={idx} className="h-2" />
          case 'hr':
            return <hr key={idx} className={`my-5 border-t ${hrColor}`} />
          case 'blockquote':
            return (
              <blockquote key={idx} className={`pl-4 border-l-4 py-2 pr-3 text-sm font-medium leading-relaxed ${blockquoteBorder}`}>
                <InlineMarkdown text={block.text} dark={dark} />
              </blockquote>
            )
          case 'list':
            return (
              <ul key={idx} className="space-y-1 my-1">
                {block.items.map((item, j) => (
                  <li key={j} className={`ml-4 text-sm font-medium leading-relaxed list-disc ${baseText}`}>
                    <InlineMarkdown text={item} dark={dark} />
                  </li>
                ))}
              </ul>
            )
          case 'numbered':
            return (
              <ol key={idx} className="space-y-1 my-1">
                {block.items.map((item, j) => (
                  <li key={j} className={`ml-4 text-sm font-medium leading-relaxed list-decimal ${baseText}`}>
                    <InlineMarkdown text={item} dark={dark} />
                  </li>
                ))}
              </ol>
            )
          case 'table':
            return (
              <div key={idx} className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      {block.headers.map((h, j) => (
                        <th key={j} className={`px-3 py-2 text-left font-semibold ${tableHead}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className={`border-t ${tableRow} ${j % 2 === 1 ? tableRowAlt : ''}`}>
                        {row.map((cell, k) => (
                          <td key={k} className="px-3 py-2 align-top">
                            <InlineMarkdown text={cell} dark={dark} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'paragraph':
            return (
              <p key={idx} className={`text-sm font-medium leading-relaxed ${baseText}`}>
                <InlineMarkdown text={block.text} dark={dark} />
              </p>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
