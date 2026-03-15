'use client';

import { useParams } from 'next/navigation';
import NotesView from '@/components/NotesView';

export default function NotesIndexPage() {
  const { id } = useParams<{ id: string }>();
  return <NotesView startupId={id} />;
}
