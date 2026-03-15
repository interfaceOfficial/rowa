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

export async function getStartup(id: string): Promise<Startup> {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Startup not found');
  return data as Startup;
}
