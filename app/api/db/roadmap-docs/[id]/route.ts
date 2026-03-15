import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get file path first
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from('roadmap_documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  // Delete from storage
  await supabaseAdmin.storage.from('roadmap-docs').remove([doc.file_path]);

  // Delete DB record
  const { error } = await supabaseAdmin.from('roadmap_documents').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
