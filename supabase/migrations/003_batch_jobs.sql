-- Batch generation: queue multiple on-model generations from a single upload
-- Reuses the existing `uploads` storage bucket under batches/{user_id}/{job_id}/...

CREATE TABLE public.batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  mode TEXT NOT NULL DEFAULT 'on-model' CHECK (mode IN ('on-model')),
  prompt TEXT NOT NULL DEFAULT '',
  view TEXT NOT NULL DEFAULT 'front' CHECK (view IN ('front', 'back')),
  brand_face_url TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT '4:5',
  quality TEXT NOT NULL DEFAULT 'standard' CHECK (quality IN ('draft', 'standard', 'high')),
  total_count INT NOT NULL DEFAULT 0,
  completed_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.batch_job_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_job_id UUID NOT NULL REFERENCES public.batch_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_image_url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  fal_request_id TEXT,
  result_image_url TEXT,
  error_message TEXT,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_batch_jobs_user_id ON public.batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON public.batch_jobs(status);
CREATE INDEX idx_batch_jobs_created_at ON public.batch_jobs(created_at DESC);
CREATE INDEX idx_batch_job_items_batch ON public.batch_job_items(batch_job_id);
CREATE INDEX idx_batch_job_items_user ON public.batch_job_items(user_id);
CREATE INDEX idx_batch_job_items_status ON public.batch_job_items(status);

ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own batch jobs" ON public.batch_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own batch jobs" ON public.batch_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own batch jobs" ON public.batch_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own batch jobs" ON public.batch_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own batch items" ON public.batch_job_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own batch items" ON public.batch_job_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own batch items" ON public.batch_job_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own batch items" ON public.batch_job_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER batch_jobs_updated_at BEFORE UPDATE ON public.batch_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER batch_job_items_updated_at BEFORE UPDATE ON public.batch_job_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable Realtime so the queue drawer sees live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_job_items;
