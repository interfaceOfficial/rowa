'use client';

import { useMemo, useRef } from 'react';
import type { RoadmapTask } from '@/lib/api';

// ── Constants ──────────────────────────────────────────────────
const DAY_PX = 32;      // pixels per day
const ROW_H  = 44;      // task row height
const HEAD_H = 56;      // month header height
const LEFT_W = 280;     // fixed left column width

// ── Phase colours ──────────────────────────────────────────────
const PHASE_COLORS: Record<string, { bar: string; header: string; text: string }> = {
  'Idea Stage':   { bar: 'bg-purple-400',   header: 'bg-purple-50',  text: 'text-purple-700' },
  'MVP Stage':    { bar: 'bg-brand-500',     header: 'bg-blue-50',    text: 'text-blue-700'   },
  'Growth Stage': { bar: 'bg-green-500',     header: 'bg-green-50',   text: 'text-green-700'  },
};
const DEFAULT_PHASE_COLOR = { bar: 'bg-gray-400', header: 'bg-gray-50', text: 'text-gray-700' };

const STATUS_OPACITY: Record<string, string> = {
  done:        'opacity-100',
  in_progress: 'opacity-90',
  pending:     'opacity-60',
  blocked:     'opacity-80',
};

// ── Helpers ────────────────────────────────────────────────────
function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
}

interface MonthSpan { label: string; days: number; startDay: number }

function buildMonthSpans(start: Date, total: number): MonthSpan[] {
  const spans: MonthSpan[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  let day = -daysBetween(cursor, start); // offset before timeline start

  while (day < total) {
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const daysInMonth = daysBetween(cursor, nextMonth);
    const clippedStart = Math.max(day, 0);
    const clippedEnd = Math.min(day + daysInMonth, total);
    if (clippedEnd > 0) {
      spans.push({ label: monthLabel(cursor), days: clippedEnd - clippedStart, startDay: clippedStart });
    }
    day += daysInMonth;
    cursor = nextMonth;
  }
  return spans;
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
  tasks: RoadmapTask[];
  onTaskClick: (task: RoadmapTask) => void;
}

// ── Component ──────────────────────────────────────────────────
export default function GanttChart({ tasks, onTaskClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute timeline bounds
  const { timelineStart, totalDays } = useMemo(() => {
    const today = new Date();
    const dates = tasks.flatMap((t) => [parseDate(t.start_date), parseDate(t.end_date)]).filter(Boolean) as Date[];
    const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today;
    const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 90);

    const start = addDays(minDate, -7); // 1-week padding left
    const end   = addDays(maxDate, 14); // 2-week padding right
    return { timelineStart: start, totalDays: Math.max(daysBetween(start, end), 60) };
  }, [tasks]);

  const monthSpans = useMemo(() => buildMonthSpans(timelineStart, totalDays), [timelineStart, totalDays]);
  const totalWidth = totalDays * DAY_PX;

  // Today position
  const todayX = daysBetween(timelineStart, new Date()) * DAY_PX;

  // Group tasks by phase
  const phases = useMemo(() => {
    const map = new Map<string, { phase_order: number; phase_goal: string | null; tasks: RoadmapTask[] }>();
    for (const t of tasks) {
      if (!map.has(t.phase)) {
        map.set(t.phase, { phase_order: t.phase_order, phase_goal: t.phase_goal, tasks: [] });
      }
      map.get(t.phase)!.tasks.push(t);
    }
    return [...map.entries()]
      .sort((a, b) => a[1].phase_order - b[1].phase_order)
      .map(([name, data]) => ({ name, ...data }));
  }, [tasks]);

  // ── Bar positioning ──
  const barX = (start_date: string | null) => {
    const d = parseDate(start_date);
    if (!d) return 0;
    return daysBetween(timelineStart, d) * DAY_PX;
  };
  const barW = (start_date: string | null, end_date: string | null) => {
    const s = parseDate(start_date);
    const e = parseDate(end_date);
    if (!s || !e) return DAY_PX * 7;
    return Math.max(daysBetween(s, e) + 1, 1) * DAY_PX;
  };

  return (
    <div className="flex border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm select-none">

      {/* ── Fixed left column ── */}
      <div className="shrink-0 border-r border-gray-200 z-10 bg-white" style={{ width: LEFT_W }}>
        {/* Header spacer */}
        <div style={{ height: HEAD_H }} className="border-b border-gray-100 flex items-end px-4 pb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Task</span>
        </div>

        {phases.map((phase) => {
          const pc = PHASE_COLORS[phase.name] ?? DEFAULT_PHASE_COLOR;
          return (
            <div key={phase.name}>
              {/* Phase header row */}
              <div
                className={`flex items-center gap-2 px-4 border-b border-gray-100 ${pc.header}`}
                style={{ height: ROW_H }}
              >
                <span className={`text-xs font-bold uppercase tracking-wide ${pc.text}`}>{phase.name}</span>
              </div>
              {/* Task rows */}
              {phase.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center px-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ height: ROW_H }}
                  onClick={() => onTaskClick(task)}
                >
                  <span className="text-xs text-gray-700 font-medium truncate">{task.title}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── Scrollable timeline ── */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
        <div style={{ width: totalWidth, minWidth: '100%', position: 'relative' }}>

          {/* Month headers */}
          <div
            className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10"
            style={{ height: HEAD_H }}
          >
            {monthSpans.map((span, i) => (
              <div
                key={i}
                className="shrink-0 border-r border-gray-200 flex items-end px-3 pb-2"
                style={{ width: span.days * DAY_PX }}
              >
                <span className="text-xs font-semibold text-gray-400">{span.label}</span>
              </div>
            ))}
          </div>

          {/* Week grid lines (every 7 days) */}
          <div className="absolute inset-0 pointer-events-none" style={{ top: HEAD_H }}>
            {Array.from({ length: Math.floor(totalDays / 7) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-gray-100"
                style={{ left: i * 7 * DAY_PX }}
              />
            ))}
          </div>

          {/* Today line */}
          {todayX >= 0 && todayX <= totalWidth && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: todayX, top: HEAD_H }}
            >
              <div className="w-0.5 h-full bg-red-400 opacity-80" />
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-red-400" />
            </div>
          )}

          {/* Task rows with bars */}
          {phases.map((phase) => {
            const pc = PHASE_COLORS[phase.name] ?? DEFAULT_PHASE_COLOR;
            return (
              <div key={phase.name}>
                {/* Phase header row (timeline side) */}
                <div
                  className={`border-b border-gray-100 ${pc.header}`}
                  style={{ height: ROW_H }}
                />
                {/* Task rows */}
                {phase.tasks.map((task) => {
                  const x = barX(task.start_date);
                  const w = barW(task.start_date, task.end_date);
                  const opacity = STATUS_OPACITY[task.status] ?? 'opacity-70';
                  const barStyle = pc.bar;

                  return (
                    <div
                      key={task.id}
                      className="relative border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      style={{ height: ROW_H }}
                      onClick={() => onTaskClick(task)}
                    >
                      {/* Bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full
                                    ${barStyle} ${opacity} flex items-center px-3 overflow-hidden
                                    shadow-sm hover:shadow-md transition-shadow`}
                        style={{ left: x, width: Math.max(w, 20) }}
                      >
                        {w > 60 && (
                          <span className="text-white text-[10px] font-semibold truncate">{task.title}</span>
                        )}
                        {task.status === 'done' && (
                          <span className="ml-auto text-white text-[10px]">✓</span>
                        )}
                        {task.status === 'blocked' && (
                          <span className="ml-auto text-white text-[10px]">!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
