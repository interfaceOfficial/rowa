'use client';

import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, type Task, type TaskStatus, type TaskPayload } from '@/lib/api';
import KanbanCard from './KanbanCard';
import TaskModal from './TaskModal';

const COLUMNS: { status: TaskStatus; label: string; color: string; headerColor: string }[] = [
  { status: 'ideen',   label: 'Ideen',   color: 'bg-purple-50', headerColor: 'text-purple-700 bg-purple-100' },
  { status: 'backlog', label: 'Backlog', color: 'bg-gray-50',   headerColor: 'text-gray-700 bg-gray-200'    },
  { status: 'working', label: 'Working', color: 'bg-blue-50',   headerColor: 'text-blue-700 bg-blue-100'    },
  { status: 'onhold',  label: 'On Hold', color: 'bg-yellow-50', headerColor: 'text-yellow-700 bg-yellow-100'},
  { status: 'done',    label: 'Done',    color: 'bg-green-50',  headerColor: 'text-green-700 bg-green-100'  },
];

interface Props {
  startupId: string;
}

export default function KanbanBoard({ startupId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTask, setEditTask]         = useState<Task | undefined>();
  const [modalStatus, setModalStatus]   = useState<TaskStatus>('ideen');

  // Drag state
  const [dragId, setDragId]     = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  useEffect(() => {
    getTasks(startupId).then((data) => { setTasks(data); setLoading(false); });
  }, [startupId]);

  // ── Helpers ────────────────────────────────────────────────
  const openCreate = (status: TaskStatus) => {
    setEditTask(undefined);
    setModalStatus(status);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setModalStatus(task.status);
    setModalOpen(true);
  };

  const handleSave = async (payload: TaskPayload) => {
    if (editTask) {
      const updated = await updateTask(editTask.id, payload);
      setTasks((prev) => prev.map((t) => (t.id === editTask.id ? updated : t)));
    } else {
      const created = await createTask(payload);
      setTasks((prev) => [...prev, created]);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editTask) return;
    await deleteTask(editTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== editTask.id));
    setModalOpen(false);
  };

  // ── Drag & Drop ────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDragId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!dragId || dragId === '') return;
    const task = tasks.find((t) => t.id === dragId);
    if (!task || task.status === status) { setDragId(null); setDragOver(null); return; }

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === dragId ? { ...t, status } : t)));
    setDragId(null);
    setDragOver(null);
    await updateTask(dragId, { status });
  };

  if (loading) {
    return <div className="text-sm text-gray-400 py-8 text-center">Board wird geladen …</div>;
  }

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            const isOver   = dragOver === col.status;

            return (
              <div
                key={col.status}
                className={`flex flex-col w-64 rounded-2xl transition-all duration-150
                            ${col.color}
                            ${isOver
                              ? 'shadow-[0_0_0_2px_#4f6ef7] scale-[1.01]'
                              : ''
                            }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(col.status)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${col.headerColor}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{colTasks.length}</span>
                  </div>
                  <button
                    onClick={() => openCreate(col.status)}
                    className="text-gray-400 hover:text-brand-500 transition-colors text-lg leading-none font-light"
                    title="Aufgabe hinzufügen"
                  >
                    +
                  </button>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5 px-3 pb-4 flex-1 min-h-[120px]">
                  {colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onClick={() => openEdit(task)}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    />
                  ))}

                  {/* Drop hint when dragging over empty column */}
                  {isOver && colTasks.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-brand-300
                                    h-16 flex items-center justify-center text-xs text-brand-400">
                      Hier ablegen
                    </div>
                  )}
                </div>

                {/* Add button at bottom */}
                <button
                  onClick={() => openCreate(col.status)}
                  className="mx-3 mb-3 rounded-xl border border-dashed border-gray-300
                             py-2 text-xs text-gray-400 hover:border-brand-400 hover:text-brand-500
                             transition-colors"
                >
                  + Aufgabe
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <TaskModal
          startupId={startupId}
          initialStatus={modalStatus}
          task={editTask}
          onSave={handleSave}
          onDelete={editTask ? handleDelete : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
