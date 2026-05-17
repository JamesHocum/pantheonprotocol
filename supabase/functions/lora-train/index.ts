import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Uses Replicate's SDXL LoRA training endpoint.
// https://replicate.com/replicate/sdxl-lora-trainer
const TRAINER = 'replicate/sdxl-lora-trainer';
const TRAINER_VERSION = 'b14d5db4f8a6f5e6d9e0b8a9c2a4b1f6f5e7c8a9b1c2d3e4f5a6b7c8d9e0f1a2'; // placeholder; will resolve dynamically

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claims.claims.sub;

    const { name, datasetPath, triggerWord, steps = 1000, learningRate = 0.0001, rank = 16, baseModel = 'sdxl-1.0' } = await req.json();
    if (!name || !datasetPath) {
      return new Response(JSON.stringify({ error: 'name and datasetPath required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create signed URL for the dataset (Replicate needs to download it)
    const { data: signed, error: signErr } = await supabase.storage
      .from('lora-datasets')
      .createSignedUrl(datasetPath, 60 * 60); // 1 hour
    if (signErr || !signed) {
      return new Response(JSON.stringify({ error: 'Failed to sign dataset URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert job record first
    const { data: job, error: insertErr } = await supabase
      .from('lora_jobs')
      .insert({
        user_id: userId, name, base_model: baseModel,
        dataset_path: datasetPath, trigger_word: triggerWord,
        steps, learning_rate: learningRate, rank, status: 'starting',
      })
      .select()
      .single();
    if (insertErr || !job) {
      return new Response(JSON.stringify({ error: insertErr?.message || 'Insert failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Resolve latest trainer version dynamically
    const verRes = await fetch(`https://api.replicate.com/v1/models/${TRAINER}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
    });
    const verData = await verRes.json();
    const version = verData?.latest_version?.id || TRAINER_VERSION;

    // Start training
    const trainRes = await fetch(`https://api.replicate.com/v1/models/${TRAINER}/versions/${version}/trainings`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: `${Deno.env.get('REPLICATE_DESTINATION') || 'replicate/sdxl-lora-trainer'}`,
        input: {
          input_images: signed.signedUrl,
          token_string: triggerWord || 'TOK',
          max_train_steps: steps,
          learning_rate: learningRate,
          lora_rank: rank,
        },
      }),
    });
    const trainData = await trainRes.json();

    if (!trainRes.ok) {
      await supabase.from('lora_jobs').update({ status: 'failed', error: JSON.stringify(trainData) }).eq('id', job.id);
      return new Response(JSON.stringify({ error: 'Training start failed', detail: trainData, job_id: job.id }),
        { status: trainRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('lora_jobs').update({
      replicate_training_id: trainData.id, status: trainData.status || 'starting',
    }).eq('id', job.id);

    return new Response(JSON.stringify({ job_id: job.id, replicate_training_id: trainData.id, status: trainData.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('lora-train error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
