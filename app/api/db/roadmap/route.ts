import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const startupId = req.nextUrl.searchParams.get('startup_id');
  if (!startupId) return NextResponse.json({ error: 'startup_id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('roadmap_tasks')
    .select('*')
    .eq('startup_id', startupId)
    .order('phase_order', { ascending: true })
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Bulk insert (seed) or single insert
  if (Array.isArray(body)) {
    const { error } = await supabaseAdmin.from('roadmap_tasks').insert(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data, error } = await supabaseAdmin
    .from('roadmap_tasks')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
