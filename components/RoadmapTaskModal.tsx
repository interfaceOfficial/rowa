'use client';

import { useEffect, useRef, useState } from 'react';
import {
  type RoadmapTask, type RoadmapDocument, type RoadmapTaskPayload,
  getRoadmapDocuments, createRoadmapDocument, deleteRoadmapDocument,
  getRoadmapDocumentUrl,
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────
interface Props {
  task: RoadmapTask;
  onSave: (updates: Partial<RoadmapTaskPayload>) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'] as const;
const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Ausstehend',   color: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: 'In Arbeit',    color: 'bg-blue-100 text-blue-700' },
  { value: 'done',        label: 'Erledigt',     color: 'bg-green-100 text-green-700' },
  { value: 'blocked',     label: 'Blockiert',    color: 'bg-red-100 text-red-700' },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low:    'bg-gray-100 text-gray-500',
};

function formatBytes(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── Component ──────────────────────────────────────────────────
export default function RoadmapTaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle]       = useState(task.title);
  const [description, setDesc]  = useState(task.description ?? '');
  const [notes, setNotes]       = useState(task.notes ?? '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus]     = useState(task.status);
  const [startDate, setStart]   = useState(task.start_date ?? '');
  const [endDate, setEnd]       = useState(task.end_date ?? '');

  const [docs, setDocs]           = useState<RoadmapDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRoadmapDocuments(task.id)
      .then(setDocs)
      .finally(() => setDocsLoading(false));
  }, [task.id]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title,
      description: description || null,
      notes: notes || null,
      priority,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
    });
    setSaving(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await createRoadmapDocument(task.id, task.startup_id, file);
      setDocs((prev) => [...prev, doc]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (doc: RoadmapDocument) => {
    await deleteRoadmapDocument(doc);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleDelete = async () => {
    await onDelete();
    onClose();
  };

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{task.phase}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[priority]}`}>
                {priority}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500
                         rounded-lg px-2 py-1 -mx-2 -my-1"
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Status + Priority + Dates row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1">Priorität</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1">Startdatum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1">Enddatum</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Was soll in diesem Task erreicht werden?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1">Notizen & Details</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Recherche-Ergebnisse, Links, Entscheidungen, nächste Schritte …"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-medium">Dokumente</label>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? 'Wird hochgeladen …' : '+ Datei hochladen'}
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            </div>

            {docsLoading ? (
              <p className="text-xs text-gray-400">Lädt …</p>
            ) : docs.length === 0 ? (
              <p className="text-xs text-gray-400">Noch keine Dokumente hochgeladen.</p>
            ) : (
              <ul className="space-y-1.5">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <a
                      href={getRoadmapDocumentUrl(doc.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 text-sm text-brand-600 hover:underline truncate"
                    >
                      {doc.name}
                    </a>
                    {doc.file_size && (
                      <span className="text-xs text-gray-400 shrink-0">{formatBytes(doc.file_size)}</span>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc)}
                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Wirklich löschen?</span>
              <button onClick={handleDelete}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white font-semibold hover:bg-red-600 transition-colors">
                Ja, löschen
              </button>
              <button onClick={() => setConfirm(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition-colors">
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              Task löschen
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            {saving ? 'Wird gespeichert …' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
