
-- LoRA training jobs
CREATE TABLE public.lora_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  base_model TEXT NOT NULL DEFAULT 'stability-ai/sdxl',
  dataset_path TEXT NOT NULL,
  trigger_word TEXT,
  steps INTEGER NOT NULL DEFAULT 1000,
  learning_rate NUMERIC NOT NULL DEFAULT 0.0001,
  rank INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'queued',
  replicate_training_id TEXT,
  output_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lora_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own lora jobs" ON public.lora_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lora jobs" ON public.lora_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own lora jobs" ON public.lora_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own lora jobs" ON public.lora_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_lora_jobs_updated_at BEFORE UPDATE ON public.lora_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Dataset bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('lora-datasets', 'lora-datasets', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users view own datasets" ON storage.objects FOR SELECT
  USING (bucket_id = 'lora-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own datasets" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lora-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own datasets" ON storage.objects FOR DELETE
  USING (bucket_id = 'lora-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);
