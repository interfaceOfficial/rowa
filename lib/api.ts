import { supabase } from './supabase'; // used only for auth + storage public URLs

// ── Helpers ────────────────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'API error');
  return data as T;
}

// ── Startup ────────────────────────────────────────────────────
export interface Startup {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  business_model: string;
  stage: 'idea' | 'mvp' | 'growth';
  created_at: string;
  updated_at: string;
}

export interface CreateStartupPayload {
  name: string;
  industry: string;
  business_model: string;
  stage: 'idea' | 'mvp' | 'growth';
  user_id: string;
}

export async function createStartup(payload: CreateStartupPayload): Promise<Startup> {
  return apiFetch<Startup>('/api/db/startups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserStartups(userId: string): Promise<Startup[]> {
  return apiFetch<Startup[]>(`/api/db/startups?user_id=${encodeURIComponent(userId)}`);
}

export async function getStartup(id: string): Promise<Startup> {
  return apiFetch<Startup>(`/api/db/startups/${encodeURIComponent(id)}`);
}

// ── Tasks ──────────────────────────────────────────────────────
export type TaskStatus = 'ideen' | 'backlog' | 'working' | 'onhold' | 'done';

export interface Task {
  id: string;
  startup_id: string;
  title: string;
  tags: string[];
  due_date: string | null;
  status: TaskStatus;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskPayload {
  startup_id: string;
  title: string;
  description?: string | null;
  tags: string[];
  due_date: string | null;
  status: TaskStatus;
}

export async function getTasks(startupId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/api/db/tasks?startup_id=${encodeURIComponent(startupId)}`);
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  return apiFetch<Task>('/api/db/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: string, updates: Partial<TaskPayload>): Promise<Task> {
  return apiFetch<Task>(`/api/db/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`/api/db/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ── Roadmap ────────────────────────────────────────────────────
export type RoadmapPriority = 'High' | 'Medium' | 'Low';
export type RoadmapStatus = 'pending' | 'in_progress' | 'done' | 'blocked';

export interface RoadmapTask {
  id: string;
  startup_id: string;
  phase: string;
  phase_goal: string | null;
  phase_order: number;
  title: string;
  description: string | null;
  notes: string | null;
  priority: RoadmapPriority;
  status: RoadmapStatus;
  start_date: string | null;
  end_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapDocument {
  id: string;
  task_id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export type RoadmapTaskPayload = Pick<
  RoadmapTask,
  'startup_id' | 'phase' | 'phase_goal' | 'phase_order' | 'title' |
  'description' | 'notes' | 'priority' | 'status' | 'start_date' | 'end_date' | 'position'
>;

export async function getRoadmapTasks(startupId: string): Promise<RoadmapTask[]> {
  return apiFetch<RoadmapTask[]>(`/api/db/roadmap?startup_id=${encodeURIComponent(startupId)}`);
}

export async function createRoadmapTask(payload: RoadmapTaskPayload): Promise<RoadmapTask> {
  return apiFetch<RoadmapTask>('/api/db/roadmap', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRoadmapTask(id: string, updates: Partial<RoadmapTaskPayload>): Promise<RoadmapTask> {
  return apiFetch<RoadmapTask>(`/api/db/roadmap/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteRoadmapTask(id: string): Promise<void> {
  await apiFetch(`/api/db/roadmap/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function seedDefaultRoadmap(startupId: string): Promise<void> {
  const today = new Date();
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };

  const phases = [
    {
      phase: 'Idea Stage', phase_goal: 'Prüfen, ob die Idee einen echten Markt hat', phase_order: 1,
      tasks: [
        { title: 'Startup Idee dokumentieren', description: 'Definiere die Geschäftsidee klar', priority: 'High' },
        { title: 'Zielgruppe definieren', description: 'Persona & Marktsegment erstellen', priority: 'High' },
        { title: 'Marktanalyse durchführen', description: 'Größe, Trends und Konkurrenz prüfen', priority: 'High' },
        { title: 'Problem validieren', description: 'Interviews, Umfragen, Pain Points prüfen', priority: 'High' },
        { title: 'MVP Konzept skizzieren', description: 'Erste Funktionen & Nutzen definieren', priority: 'Medium' },
        { title: 'Name & Branding brainstormen', description: 'Name, Logo und Farben festlegen', priority: 'Medium' },
        { title: 'Business Modell prüfen', description: 'Monetarisierungsstrategie prüfen', priority: 'Medium' },
      ],
    },
    {
      phase: 'MVP Stage', phase_goal: 'Erstes Produkt bauen und erste Nutzer gewinnen', phase_order: 2,
      tasks: [
        { title: 'MVP Feature Liste erstellen', description: 'Kernfunktionen definieren', priority: 'High' },
        { title: 'MVP entwickeln', description: 'Web/App Frontend + Backend implementieren', priority: 'High' },
        { title: 'Landingpage erstellen', description: 'Erste Kunden gewinnen', priority: 'High' },
        { title: 'Early Adopters finden', description: 'Beta Nutzer rekrutieren', priority: 'High' },
        { title: 'Feedback sammeln', description: 'Interviews und Usability Tests durchführen', priority: 'High' },
        { title: 'KPIs festlegen', description: 'Nutzerzahlen, Engagement und Feedback tracken', priority: 'Medium' },
        { title: 'Dokumente & Legal', description: 'Impressum, Datenschutz und NDA erstellen', priority: 'Medium' },
      ],
    },
    {
      phase: 'Growth Stage', phase_goal: 'Wachstum steigern, Team aufbauen, Investoren gewinnen', phase_order: 3,
      tasks: [
        { title: 'Marketing-Kanäle aufbauen', description: 'SEO, Social Media und Ads implementieren', priority: 'High' },
        { title: 'Sales Pipeline erstellen', description: 'Leads, CRM und Follow-ups organisieren', priority: 'High' },
        { title: 'KPIs tracken & optimieren', description: 'CAC, LTV und Conversion Rate überwachen', priority: 'High' },
        { title: 'Team aufbauen', description: 'Entwickler, Marketing und Support rekrutieren', priority: 'High' },
        { title: 'Fundraising vorbereiten', description: 'Pitch Deck erstellen und Investorenliste prüfen', priority: 'Medium' },
        { title: 'Produkt Features erweitern', description: 'Nutzerfeedback priorisieren und implementieren', priority: 'Medium' },
        { title: 'Automatisierungen implementieren', description: 'AI, Marketing und Reporting automatisieren', priority: 'Medium' },
      ],
    },
  ];

  let day = 0;
  const rows: RoadmapTaskPayload[] = [];
  for (const phaseData of phases) {
    phaseData.tasks.forEach((task, i) => {
      const duration = task.priority === 'High' ? 10 : 7;
      rows.push({
        startup_id: startupId,
        phase: phaseData.phase,
        phase_goal: phaseData.phase_goal,
        phase_order: phaseData.phase_order,
        title: task.title,
        description: task.description,
        notes: null,
        priority: task.priority as RoadmapPriority,
        status: 'pending',
        start_date: addDays(day),
        end_date: addDays(day + duration - 1),
        position: i,
      });
      day += duration;
    });
  }

  await apiFetch('/api/db/roadmap', {
    method: 'POST',
    body: JSON.stringify(rows),
  });
}

// ── Roadmap Documents ──────────────────────────────────────────
export async function getRoadmapDocuments(taskId: string): Promise<RoadmapDocument[]> {
  return apiFetch<RoadmapDocument[]>(`/api/db/roadmap-docs?task_id=${encodeURIComponent(taskId)}`);
}

export async function createRoadmapDocument(
  taskId: string,
  startupId: string,
  file: File,
): Promise<RoadmapDocument> {
  // Upload file to Supabase Storage via admin API route
  const ext = file.name.split('.').pop();
  const filePath = `${startupId}/${taskId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('roadmap-docs')
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  return apiFetch<RoadmapDocument>('/api/db/roadmap-docs', {
    method: 'POST',
    body: JSON.stringify({
      task_id: taskId,
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    }),
  });
}

export async function deleteRoadmapDocument(doc: RoadmapDocument): Promise<void> {
  await apiFetch(`/api/db/roadmap-docs/${encodeURIComponent(doc.id)}`, { method: 'DELETE' });
}

export function getRoadmapDocumentUrl(filePath: string): string {
  const { data } = supabase.storage.from('roadmap-docs').getPublicUrl(filePath);
  return data.publicUrl;
}
