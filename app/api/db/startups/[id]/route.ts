import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('startups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
  return NextResponse.json(data);
}
