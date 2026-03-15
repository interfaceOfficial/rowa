'use client';

import { useEffect, useRef, useState } from 'react';
import { type Task, type TaskPayload, type TaskStatus } from '@/lib/api';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'ideen',   label: 'Ideen'   },
  { value: 'backlog', label: 'Backlog' },
  { value: 'working', label: 'Working' },
  { value: 'onhold',  label: 'On Hold' },
  { value: 'done',    label: 'Done'    },
];

interface Props {
  startupId: string;
  initialStatus?: TaskStatus;
  task?: Task;
  onSave:    (payload: TaskPayload) => void;
  onDelete?: () => void;
  onClose:   () => void;
}

export default function TaskModal({ startupId, initialStatus = 'ideen', task, onSave, onDelete, onClose }: Props) {
  const [title,       setTitle]       = useState(task?.title       ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status,      setStatus]      = useState<TaskStatus>(task?.status ?? initialStatus);
  const [dueDate,     setDueDate]     = useState(task?.due_date    ?? '');
  const [tagInput,    setTagInput]    = useState('');
  const [tags,        setTags]        = useState<string[]>(task?.tags ?? []);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const addTag = () => {
    const val = tagInput.replace(/^#/, '').trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) setTags(tags.slice(0, -1));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      startup_id:  startupId,
      title:       title.trim(),
      description: description.trim() || null,
      tags,
      due_date:    dueDate || null,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="font-semibold text-lg">{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Titel */}
          <div>
            <label className="block text-sm font-medium mb-1">Titel *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Was muss erledigt werden?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, Kontext oder Notizen …"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Spalte</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-300 px-3 py-2
                            focus-within:ring-2 focus-within:ring-brand-500 min-h-[42px]">
              {tags.map((t) => (
                <span key={t}
                  className="flex items-center gap-0.5 text-sm text-brand-500 font-medium">
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="ml-0.5 text-gray-400 hover:text-red-500 leading-none text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={addTag}
                placeholder={tags.length ? '' : '#tag eingeben + Enter'}
                className="flex-1 min-w-[120px] text-sm outline-none placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Enter oder Komma zum Hinzufügen</p>
          </div>

          {/* Enddatum */}
          <div>
            <label className="block text-sm font-medium mb-1">Enddatum</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div>
            {onDelete && (
              <button onClick={onDelete}
                className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Löschen
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white font-medium
                         hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
