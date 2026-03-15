'use client';

import { type Task } from '@/lib/api';

interface Props {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function isOverdue(due: string | null) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

export default function KanbanCard({ task, onClick, onDragStart }: Props) {
  const overdue = isOverdue(task.due_date);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group rounded-xl border border-gray-200 bg-white px-3.5 pt-3.5 pb-3
                 shadow-sm hover:shadow-md hover:border-gray-300 transition-all
                 cursor-pointer select-none"
    >
      {/* Titel */}
      <p className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>

      {/* Beschreibung */}
      {task.description && (
        <p className="mt-1.5 text-xs text-gray-400 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Enddatum */}
      {task.due_date && (
        <div className={`mt-2.5 flex items-center gap-1 text-xs
                        ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {overdue && <span>Überfällig · </span>}
          {new Date(task.due_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}

      {/* Tags als Hashtags */}
      {task.tags.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span key={tag} className="text-xs text-brand-500 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
