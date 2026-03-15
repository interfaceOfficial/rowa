import { supabase } from './supabase';

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
  const { data, error } = await supabase
    .from('startups')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Startup;
}

export async function getUserStartups(userId: string): Promise<Startup[]> {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Startup[];
}

// ── Tasks ─────────────────────────────────────────────────────

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
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('startup_id', startupId)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<TaskPayload>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getStartup(id: string): Promise<Startup> {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Startup not found');
  return data as Startup;
}
