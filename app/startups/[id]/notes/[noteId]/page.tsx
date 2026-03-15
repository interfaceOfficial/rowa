'use client';

import { useParams } from 'next/navigation';
import NotesView from '@/components/NotesView';

export default function NotePage() {
  const { id, noteId } = useParams<{ id: string; noteId: string }>();
  return <NotesView startupId={id} initialNoteId={noteId} />;
}
