import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Replicate model versions (stable, known-good SDXL family)
const MODELS: Record<string, string> = {
  // SDXL 1.0 base
  'sdxl-1.0':       'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  // Newest open-source SDXL-class (SDXL Lightning 4-step, much faster)
  'sdxl-lightning': 'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, model = 'sdxl-lightning', negative_prompt, width = 1024, height = 1024, num_outputs = 1 } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const version = MODELS[model] ?? MODELS['sdxl-lightning'];

    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        version,
        input: { prompt, negative_prompt, width, height, num_outputs },
      }),
    });

    const data = await startRes.json();
    if (!startRes.ok) {
      console.error('Replicate error:', data);
      return new Response(JSON.stringify({ error: data?.detail || 'Replicate request failed' }),
        { status: startRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Poll if still running (Prefer:wait=60 usually finishes; this is a safety net)
    let result = data;
    let attempts = 0;
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      const p = await fetch(result.urls.get, { headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` } });
      result = await p.json();
      attempts++;
    }

    if (result.status !== 'succeeded') {
      return new Response(JSON.stringify({ error: result.error || 'Generation failed', status: result.status }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const output = Array.isArray(result.output) ? result.output : [result.output];
    return new Response(JSON.stringify({ images: output, model, prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('sdxl-generate error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
