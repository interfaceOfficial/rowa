'use client';

import { useEffect, useState } from 'react';
import {
  type RoadmapTask, type RoadmapTaskPayload, type RoadmapPriority, type RoadmapStatus,
  getRoadmapTasks, createRoadmapTask, updateRoadmapTask, deleteRoadmapTask, seedDefaultRoadmap,
} from '@/lib/api';
import GanttChart from './GanttChart';
import RoadmapTaskModal from './RoadmapTaskModal';

// ── Constants ──────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low:    'bg-gray-100 text-gray-500',
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; row: string }> = {
  pending:     { label: 'Ausstehend',  dot: 'bg-gray-300',   row: '' },
  in_progress: { label: 'In Arbeit',   dot: 'bg-brand-500',  row: 'bg-blue-50/40' },
  done:        { label: 'Erledigt',    dot: 'bg-green-500',  row: 'bg-green-50/40' },
  blocked:     { label: 'Blockiert',   dot: 'bg-red-400',    row: 'bg-red-50/40' },
};

const PHASE_COLORS: Record<string, { badge: string; border: string }> = {
  'Idea Stage':   { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  'MVP Stage':    { badge: 'bg-blue-100 text-blue-700',     border: 'border-blue-200'   },
  'Growth Stage': { badge: 'bg-green-100 text-green-700',   border: 'border-green-200'  },
};
const DEFAULT_PHASE = { badge: 'bg-gray-100 text-gray-600', border: 'border-gray-200' };

// ── Add Task Form ──────────────────────────────────────────────
interface AddTaskProps {
  startupId: string;
  phases: string[];
  onAdded: (task: RoadmapTask) => void;
  onCancel: () => void;
}

function AddTaskForm({ startupId, phases, onAdded, onCancel }: AddTaskProps) {
  const [title, setTitle]       = useState('');
  const [phase, setPhase]       = useState(phases[0] ?? 'Idea Stage');
  const [customPhase, setCustom] = useState('');
  const [priority, setPriority] = useState<RoadmapPriority>('Medium');
  const [saving, setSaving]     = useState(false);

  const effectivePhase = phase === '__new__' ? customPhase : phase;

  const handleSave = async () => {
    if (!title.trim() || !effectivePhase.trim()) return;
    setSaving(true);
    try {
      const created = await createRoadmapTask({
        startup_id: startupId,
        phase: effectivePhase,
        phase_goal: null,
        phase_order: 999,
        title: title.trim(),
        description: null,
        notes: null,
        priority,
        status: 'pending',
        start_date: null,
        end_date: null,
        position: 0,
      });
      onAdded(created);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-brand-200 bg-brand-50/30 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task-Titel"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as RoadmapPriority)}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {phases.map((p) => <option key={p} value={p}>{p}</option>)}
          <option value="__new__">+ Neue Phase …</option>
        </select>
        {phase === '__new__' && (
          <input
            value={customPhase}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Name der neuen Phase"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !effectivePhase.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white font-semibold
                     hover:bg-brand-600 transition-colors disabled:opacity-40"
        >
          {saving ? 'Wird gespeichert …' : 'Task hinzufügen'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium
                     hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────
function PhaseProgress({ tasks }: { tasks: RoadmapTask[] }) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 shrink-0">{done}/{tasks.length}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
interface Props { startupId: string }

export default function RoadmapView({ startupId }: Props) {
  const [tasks, setTasks]         = useState<RoadmapTask[]>([]);
  const [loading, setLoading]     = useState(true);
  const [seeding, setSeeding]     = useState(false);
  const [tab, setTab]             = useState<'list' | 'gantt'>('list');
  const [selectedTask, setSelected] = useState<RoadmapTask | null>(null);
  const [showAddForm, setShowAdd]   = useState(false);

  useEffect(() => {
    getRoadmapTasks(startupId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [startupId]);

  const phases = [...new Set(tasks.map((t) => t.phase))];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDefaultRoadmap(startupId);
      const fresh = await getRoadmapTasks(startupId);
      setTasks(fresh);
    } finally {
      setSeeding(false);
    }
  };

  const handleTaskSave = async (updates: Partial<RoadmapTaskPayload>) => {
    if (!selectedTask) return;
    const updated = await updateRoadmapTask(selectedTask.id, updates);
    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
    setSelected(updated);
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    await deleteRoadmapTask(selectedTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
    setSelected(null);
  };

  const handleStatusClick = async (task: RoadmapTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const order: RoadmapStatus[] = ['pending', 'in_progress', 'done', 'blocked'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    const updated = await updateRoadmapTask(task.id, { status: next });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  // ── Loading / Empty states ──
  if (loading) {
    return <div className="text-sm text-gray-400 py-8 text-center">Roadmap wird geladen …</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">🗺️</div>
        <h3 className="text-lg font-bold">Noch keine Roadmap</h3>
        <p className="text-sm text-gray-500">Starte mit der Standard-Roadmap oder füge eigene Tasks hinzu.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm text-white font-semibold
                       hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            {seeding ? 'Wird erstellt …' : '✦ Standard-Roadmap laden'}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold
                       hover:bg-gray-50 transition-colors"
          >
            + Eigene Tasks
          </button>
        </div>
        {showAddForm && (
          <div className="max-w-lg mx-auto mt-4">
            <AddTaskForm
              startupId={startupId}
              phases={['Idea Stage', 'MVP Stage', 'Growth Stage']}
              onAdded={(t) => { setTasks([t]); setShowAdd(false); }}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
          {(['list', 'gantt'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all
                ${tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'list' ? '☰ Liste' : '▦ Gantt'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm text-white font-semibold
                     hover:bg-brand-600 transition-colors"
        >
          + Task
        </button>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <AddTaskForm
          startupId={startupId}
          phases={phases.length ? phases : ['Idea Stage']}
          onAdded={(t) => { setTasks((prev) => [...prev, t]); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* ── LIST VIEW ── */}
      {tab === 'list' && (
        <div className="space-y-6">
          {phases.map((phaseName) => {
            const phaseTasks = tasks.filter((t) => t.phase === phaseName);
            const pc = PHASE_COLORS[phaseName] ?? DEFAULT_PHASE;
            const phaseGoal = phaseTasks[0]?.phase_goal;

            return (
              <div key={phaseName} className={`rounded-2xl border ${pc.border} overflow-hidden`}>
                {/* Phase header */}
                <div className={`px-5 py-4 ${pc.badge.split(' ')[0].replace('text', 'bg').replace('-700', '-50').replace('-600', '-50')}`}>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${pc.badge}`}>
                        {phaseName}
                      </span>
                      <span className="text-xs text-gray-400">{phaseTasks.length} Tasks</span>
                    </div>
                  </div>
                  {phaseGoal && <p className="text-xs text-gray-500">{phaseGoal}</p>}
                  <div className="mt-3">
                    <PhaseProgress tasks={phaseTasks} />
                  </div>
                </div>

                {/* Task rows */}
                <div className="bg-white divide-y divide-gray-50">
                  {phaseTasks.map((task) => {
                    const sc = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer
                                    hover:bg-gray-50 transition-colors ${sc.row}`}
                        onClick={() => setSelected(task)}
                      >
                        {/* Status dot (click to cycle) */}
                        <button
                          onClick={(e) => handleStatusClick(task, e)}
                          title={sc.label}
                          className={`w-3.5 h-3.5 rounded-full shrink-0 transition-transform hover:scale-125 ${sc.dot}`}
                        />

                        {/* Title */}
                        <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.title}
                        </span>

                        {/* Dates */}
                        {task.start_date && (
                          <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                            {new Date(task.start_date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                            {task.end_date && (
                              <> → {new Date(task.end_date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</>
                            )}
                          </span>
                        )}

                        {/* Priority badge */}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>

                        {/* Status label */}
                        <span className="text-xs text-gray-400 shrink-0 hidden md:block w-20 text-right">{sc.label}</span>

                        {/* Chevron */}
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GANTT VIEW ── */}
      {tab === 'gantt' && (
        <div>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-1 bg-red-400 rounded" /> Heute
            </div>
            {Object.entries(PHASE_COLORS).map(([name, colors]) => (
              <div key={name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className={`w-3 h-3 rounded-full ${colors.badge.split(' ')[0]}`} />
                {name}
              </div>
            ))}
          </div>
          <GanttChart tasks={tasks} onTaskClick={setSelected} />
        </div>
      )}

      {/* Task modal */}
      {selectedTask && (
        <RoadmapTaskModal
          task={selectedTask}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
