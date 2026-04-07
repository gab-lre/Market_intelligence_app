import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Write test
    const { data: insertData, error: insertError } = await supabase
      .from('collections_history')
      .insert([
        { 
          source: 'test_connection', 
          status: 'succès', 
          items_collected: 0,
          duration_seconds: 1 
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // 2. Read test
    const { data: readData, error: readError } = await supabase
      .from('collections_history')
      .select('*')
      .eq('id', insertData.id)
      .single()

    if (readError) throw readError

    // 3. Clean up test
    await supabase
      .from('collections_history')
      .delete()
      .eq('id', insertData.id)

    return NextResponse.json({ 
        success: true, 
        message: 'Supabase connection successful! Write, read, and delete worked perfectly.', 
        data: readData 
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
