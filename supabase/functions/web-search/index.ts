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
    const { query, torMode = false } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Web search query:', query, 'Tor mode:', torMode);

    const systemPrompt = torMode 
      ? `You are a dark web research assistant. Search for information about: "${query}". 
         Focus on security research, privacy tools, and ethical hacking resources.
         Provide accurate, educational information only. Never provide instructions for illegal activities.
         Format your response with clear sections and bullet points.`
      : `You are a helpful web search assistant. Search for current information about: "${query}".
         Provide accurate, up-to-date information with sources when possible.
         Format your response with clear sections and bullet points.`;

    // Route through TOR proxy when torMode is enabled and TOR_PROXY_URL is configured.
    const TOR_PROXY_URL = Deno.env.get('TOR_PROXY_URL');
    const useProxy = torMode && TOR_PROXY_URL;
    let fetchUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const fetchHeaders: Record<string, string> = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    };
    if (useProxy) {
      // Forward through user-provided HTTP proxy that accepts a `target` query param
      // (e.g. a Tor-exit relay or SOCKS-to-HTTP bridge).
      fetchUrl = `${TOR_PROXY_URL.replace(/\/$/, '')}/proxy?target=${encodeURIComponent(fetchUrl)}`;
      fetchHeaders['X-Tor-Route'] = '1';
      console.log('Routing AI gateway call through TOR proxy');
    }

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
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
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No results found.';

    console.log('Web search completed successfully');

    return new Response(
      JSON.stringify({ result, query, torMode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Web search error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Web search failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
