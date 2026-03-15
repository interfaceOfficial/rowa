export type StartupStage = 'idea' | 'mvp' | 'growth';

export type BusinessModel = 'saas' | 'marketplace' | 'ecommerce' | 'agency' | 'other';

export type Industry =
  | 'fintech'
  | 'healthtech'
  | 'edtech'
  | 'ecommerce'
  | 'proptech'
  | 'legaltech'
  | 'cleantech'
  | 'hrtech'
  | 'logistics'
  | 'other';

export interface Startup {
  id: string;
  user_id: string;
  name: string;
  industry: Industry;
  business_model: BusinessModel;
  stage: StartupStage;
  created_at: string;
  updated_at: string;
}

export interface CreateStartupBody {
  name: string;
  industry: Industry;
  business_model: BusinessModel;
  stage: StartupStage;
  // In production this comes from the auth session, not the request body
  user_id: string;
}
