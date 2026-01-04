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
    const { category = 'all' } = await req.json().catch(() => ({}));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching hacker news for category:', category);

    const categoryPrompts: Record<string, string> = {
      all: 'cybersecurity news, data breaches, vulnerabilities, hacking tools, and security research',
      vulnerabilities: 'latest CVEs, zero-day exploits, and security vulnerabilities discovered',
      breaches: 'recent data breaches, leaks, and security incidents',
      tools: 'new hacking tools, security software releases, and open source security projects',
      research: 'security research papers, threat intelligence reports, and malware analysis',
    };

    const topicFocus = categoryPrompts[category] || categoryPrompts.all;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are a cybersecurity news aggregator. Generate 5 realistic, current-sounding news items about ${topicFocus}. 
            Each news item should have:
            - A compelling headline
            - A brief summary (2-3 sentences)
            - A category tag
            - A realistic source name
            - A realistic timestamp (within the last 24-48 hours)
            
            Format as JSON array with objects containing: headline, summary, category, source, timestamp, severity (low/medium/high/critical).
            Make the news items educational and focused on defensive security awareness.`
          },
          { 
            role: 'user', 
            content: `Generate the latest ${category} cybersecurity news feed.`
          }
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
      console.error('News fetch error:', response.status, errorText);
      throw new Error(`News fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    // Try to parse as JSON, fallback to raw content
    let newsItems;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      newsItems = JSON.parse(jsonStr);
    } catch {
      console.log('Could not parse news as JSON, returning raw content');
      newsItems = [{ 
        headline: 'Security News Update',
        summary: content,
        category: category,
        source: 'CyberCafe Intel',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      }];
    }

    console.log('News fetched successfully:', newsItems.length, 'items');

    return new Response(
      JSON.stringify({ news: newsItems, category }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Hacker news error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch news' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
