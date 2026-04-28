const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://knowledgemarket.app',
      'X-Title': 'KnowledgeMarket',
    },
    body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.3 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function classifyWithAI(text: string): Promise<{
  domain: string; subDomain: string; topic: string;
  questionType: string; difficulty: string; confidence: number; reasoning: string;
}> {
  const prompt = `You are a domain classifier for an expert knowledge marketplace.
Classify the following question into the most fitting category.

Available domains: medicine, engineering, mathematics, physics, computer-science, law, business, chemistry, biology, education, psychology, architecture, economics, nutrition, sports, environmental, philosophy, history, arts, linguistics

Respond ONLY with valid JSON in this exact format:
{
  "domain": "<slug>",
  "subDomain": "<relevant subdomain>",
  "topic": "<specific topic>",
  "questionType": "explanation|problem_solving|advice|diagnosis|analysis|other",
  "difficulty": "beginner|intermediate|advanced|expert",
  "confidence": <0.0-1.0>,
  "reasoning": "<one sentence>"
}

Question: "${text.slice(0, 800)}"`;

  const raw = await callOpenRouter([{ role: 'user', content: prompt }]);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in AI response');
  return JSON.parse(match[0]);
}
