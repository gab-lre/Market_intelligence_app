import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ opportunities: [], reports: [] })
  }

  const pattern = `%${q}%`

  const [{ data: opportunities }, { data: reports }] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id, title, score_global, opportunity_type, status')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .eq('status', 'active')
      .order('score_global', { ascending: false })
      .limit(5),
    supabase
      .from('generated_reports')
      .select('id, type, title, created_at')
      .ilike('title', pattern)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    opportunities: opportunities ?? [],
    reports: reports ?? [],
  })
}
