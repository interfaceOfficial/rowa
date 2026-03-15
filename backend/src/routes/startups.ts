import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../db/client';

const router = Router();

// ── Validation schema ─────────────────────────────────────────
const createStartupSchema = z.object({
  name: z.string().min(1).max(255),
  industry: z.enum([
    'fintech', 'healthtech', 'edtech', 'ecommerce',
    'proptech', 'legaltech', 'cleantech', 'hrtech', 'logistics', 'other',
  ]),
  business_model: z.enum(['saas', 'marketplace', 'ecommerce', 'agency', 'other']),
  stage: z.enum(['idea', 'mvp', 'growth']),
  // In production: extract user_id from JWT middleware
  user_id: z.string().uuid(),
});

// ── POST /startups ────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const result = createStartupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }

  const { data, error } = await supabase
    .from('startups')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error('Error creating startup:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ startup: data });
});

// ── GET /startups/:id ─────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Startup not found' });
  }

  return res.json({ startup: data });
});

// ── GET /startups?user_id=... ─────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id query param required' });
  }

  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing startups:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json({ startups: data });
});

export default router;
