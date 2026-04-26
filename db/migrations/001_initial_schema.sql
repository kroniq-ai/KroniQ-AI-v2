-- VØYD MVP - Initial Schema
-- Run in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Users (extends Supabase auth.users; we sync profile data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  idea_text TEXT NOT NULL,
  context_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_idea_text_fts ON projects USING gin(to_tsvector('english', idea_text));

-- Agents (per-project agent state)
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  last_run TIMESTAMPTZ,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed'))
);

CREATE INDEX idx_agents_project_id ON agents(project_id);

-- Jobs (agent task queue)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  prompt TEXT,
  response_ref JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_project_id ON jobs(project_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Research items (with vector for semantic search)
CREATE TABLE IF NOT EXISTS public.research_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  snippet TEXT,
  source_url TEXT,
  embedding_vector vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_items_project_id ON research_items(project_id);
CREATE INDEX idx_research_items_embedding ON research_items USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_research_items_snippet_fts ON research_items USING gin(to_tsvector('english', snippet));

-- Competitors
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  strengths JSONB,
  weaknesses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitors_project_id ON competitors(project_id);

-- MVP features
CREATE TABLE IF NOT EXISTS public.mvp_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  must_have BOOLEAN DEFAULT true,
  est_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mvp_features_project_id ON mvp_features(project_id);

-- Marketing assets
CREATE TABLE IF NOT EXISTS public.marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_assets_project_id ON marketing_assets(project_id);

-- Financials
CREATE TABLE IF NOT EXISTS public.financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  revenue_model TEXT,
  price_point TEXT,
  costs JSONB,
  unit_economics JSONB,
  pricing_options JSONB,
  initial_costs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financials_project_id ON financials(project_id);

-- Memories (project memory)
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  embedding_vector vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_project_id ON memories(project_id);

-- Artifacts
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);

-- API keys (user-provided OpenRouter keys)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openrouter',
  encrypted_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: users can CRUD own
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- All project-related tables: users can access via project ownership
CREATE POLICY "agents_select_own" ON public.agents FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = agents.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "agents_insert_own" ON public.agents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = agents.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "agents_update_own" ON public.agents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = agents.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "jobs_select_own" ON public.jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = jobs.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = jobs.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = jobs.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "research_items_select_own" ON public.research_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = research_items.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "research_items_insert_own" ON public.research_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = research_items.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "competitors_select_own" ON public.competitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = competitors.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "competitors_insert_own" ON public.competitors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = competitors.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "mvp_features_select_own" ON public.mvp_features FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = mvp_features.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "mvp_features_insert_own" ON public.mvp_features FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = mvp_features.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "marketing_assets_select_own" ON public.marketing_assets FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = marketing_assets.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "marketing_assets_insert_own" ON public.marketing_assets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = marketing_assets.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "financials_select_own" ON public.financials FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = financials.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "financials_insert_own" ON public.financials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = financials.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "memories_select_own" ON public.memories FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = memories.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "memories_insert_own" ON public.memories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = memories.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "artifacts_select_own" ON public.artifacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = artifacts.project_id AND p.user_id = auth.uid())
);
CREATE POLICY "artifacts_insert_own" ON public.artifacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = artifacts.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "api_keys_select_own" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "api_keys_insert_own" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "api_keys_delete_own" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
