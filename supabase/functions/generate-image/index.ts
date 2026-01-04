import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style = 'cyberpunk' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Style presets (LoRA-like modifications)
    const stylePrompts: Record<string, string> = {
      cyberpunk: 'cyberpunk style, neon lights, futuristic, dark atmosphere, high tech',
      anime: 'anime style, vibrant colors, dynamic composition, Japanese animation',
      photorealistic: 'photorealistic, highly detailed, 8k resolution, professional photography',
      darkweb: 'dark web aesthetic, hacker theme, green terminal text, matrix style, glitch art',
      synthwave: 'synthwave aesthetic, retro 80s, purple and pink neons, sunset gradients',
      glitch: 'glitch art, digital distortion, vaporwave, corrupted data aesthetic',
    };

    const styleModifier = stylePrompts[style] || stylePrompts.cyberpunk;
    const enhancedPrompt = `${prompt}, ${styleModifier}`;

    console.log('Generating image with prompt:', enhancedPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          { role: 'user', content: enhancedPrompt }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Image generation error:', response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || '';

    if (!imageUrl) {
      throw new Error('No image was generated');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        prompt: enhancedPrompt,
        style,
        description: textContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Image generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
