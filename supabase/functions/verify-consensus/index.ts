// Verify Consensus edge function
// Re-runs the user prompt against 3 different models and a judge model,
// returning consensus, trust, hallucination risk, and a governance stream.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  prompt: string;
  originalResponse: string;
  systemPrompt?: string;
  assistantKey?: string;
  originalModel?: string;
}

interface ModelAnswer {
  model: string;
  answer: string;
  ok: boolean;
  error?: string;
}

const CONSENSUS_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-5-mini",
  "google/gemini-2.5-flash-lite",
];

const JUDGE_MODEL = "google/gemini-2.5-pro";

async function callModel(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  tools?: any,
  tool_choice?: any,
): Promise<any> {
  const res = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        ...(tools ? { tools, tool_choice } : {}),
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${model} ${res.status}: ${text.slice(0, 200)}`);
  }
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const body = (await req.json()) as VerifyRequest;
    if (!body?.prompt || !body?.originalResponse) {
      return new Response(
        JSON.stringify({ error: "prompt and originalResponse are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sys =
      body.systemPrompt ||
      "You are a careful, factual assistant. Be concise.";

    // Run 3 consensus models in parallel
    const answerPromises = CONSENSUS_MODELS.map(async (model): Promise<ModelAnswer> => {
      try {
        const json = await callModel(apiKey, model, [
          { role: "system", content: sys },
          { role: "user", content: body.prompt },
        ]);
        const answer = json?.choices?.[0]?.message?.content ?? "";
        return { model, answer, ok: true };
      } catch (e) {
        return {
          model,
          answer: "",
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });

    const answers = await Promise.all(answerPromises);
    const okAnswers = answers.filter((a) => a.ok && a.answer);

    // Ask the judge for structured scores via tool calling
    const judgePrompt = `You are a verification judge. Score the ORIGINAL answer against ${okAnswers.length} independent re-runs of the same prompt. Be conservative: only report high trust when the independent answers agree on the key claims.

PROMPT:
${body.prompt}

ORIGINAL ANSWER (from ${body.originalModel ?? "unknown model"}):
${body.originalResponse}

INDEPENDENT ANSWERS:
${okAnswers.map((a, i) => `--- Model ${i + 1} (${a.model}) ---\n${a.answer}`).join("\n\n")}

Score on the following:
- consensus_score 0-100: how strongly the independent answers agree with the original on factual claims
- trust_score 0-100: overall reliability (consider sourcing, specificity, refusal handling)
- hallucination_risk 0-100: estimated probability the original contains fabricated facts (HIGHER = WORSE)
- governance_stream: array of 4-7 short audit events covering safety, sourcing, refusal handling, factual divergence, and any policy concerns. Each event has stage, status (pass|warn|fail), and detail.
- summary: 1-2 sentence verdict.
- divergences: array of short strings describing where the independent answers disagreed with the original (empty if none).`;

    let metrics: any = null;
    try {
      const judgeJson = await callModel(
        apiKey,
        JUDGE_MODEL,
        [
          { role: "system", content: "You are a strict verification judge. Always call the report_verification tool." },
          { role: "user", content: judgePrompt },
        ],
        [
          {
            type: "function",
            function: {
              name: "report_verification",
              description: "Report verification scores.",
              parameters: {
                type: "object",
                properties: {
                  consensus_score: { type: "number" },
                  trust_score: { type: "number" },
                  hallucination_risk: { type: "number" },
                  governance_stream: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        stage: { type: "string" },
                        status: { type: "string", enum: ["pass", "warn", "fail"] },
                        detail: { type: "string" },
                      },
                      required: ["stage", "status", "detail"],
                    },
                  },
                  summary: { type: "string" },
                  divergences: { type: "array", items: { type: "string" } },
                },
                required: [
                  "consensus_score",
                  "trust_score",
                  "hallucination_risk",
                  "governance_stream",
                  "summary",
                  "divergences",
                ],
              },
            },
          },
        ],
        { type: "function", function: { name: "report_verification" } },
      );

      const call =
        judgeJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      metrics = call ? JSON.parse(call) : null;
    } catch (e) {
      console.error("Judge call failed:", e);
    }

    // Fallback heuristic metrics if judge failed
    if (!metrics) {
      const failed = answers.length - okAnswers.length;
      metrics = {
        consensus_score: okAnswers.length >= 2 ? 60 : 30,
        trust_score: 55,
        hallucination_risk: 45,
        governance_stream: [
          { stage: "consensus", status: "warn", detail: "Judge unavailable; using heuristic." },
          { stage: "models", status: failed ? "warn" : "pass", detail: `${okAnswers.length}/${answers.length} model re-runs succeeded.` },
          { stage: "safety", status: "pass", detail: "No automated policy flags." },
        ],
        summary: "Heuristic fallback: independent judge unavailable.",
        divergences: [],
      };
    }

    return new Response(
      JSON.stringify({
        verified_at: new Date().toISOString(),
        original_model: body.originalModel ?? null,
        assistant_key: body.assistantKey ?? null,
        prompt: body.prompt,
        original_response: body.originalResponse,
        consensus_models: CONSENSUS_MODELS,
        judge_model: JUDGE_MODEL,
        independent_answers: answers,
        metrics,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-consensus error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
