import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const startupId = req.nextUrl.searchParams.get('startup_id');
  if (!startupId) return NextResponse.json({ error: 'startup_id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('startup_id', startupId)
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
