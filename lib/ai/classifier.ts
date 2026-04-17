import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ClassificationResult {
  domain: string;
  subDomain: string;
  topic: string;
  questionType: 'explanation' | 'problem_solving' | 'advice' | 'diagnosis' | 'review';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  reasoning: string;
  safetyFlags: string[];
  isSafe: boolean;
  keywords: string[];
}

export async function classifyQuestion(
  text: string,
  availableDomains: string[]
): Promise<ClassificationResult> {
  const start = Date.now();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are an expert question classifier for a knowledge marketplace.
Classify the question and return ONLY valid JSON matching this exact schema:
{
  "domain": "slug from available domains",
  "subDomain": "relevant subdomain slug",
  "topic": "specific topic slug",
  "questionType": "explanation|problem_solving|advice|diagnosis|review",
  "difficulty": "beginner|intermediate|advanced|expert",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "safetyFlags": [],
  "isSafe": true,
  "keywords": ["keyword1","keyword2"]
}
Available domains: ${availableDomains.join(', ')}
Safety rules: Flag if question asks for harmful medical/legal advice that could hurt people, illegal activities, violence, or misinformation.`,
    messages: [{ role: 'user', content: `Classify this question:\n\n${text}` }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Classification returned invalid JSON');

  const result = JSON.parse(jsonMatch[0]) as ClassificationResult;
  return result;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Claude to generate a semantic fingerprint via structured analysis
  // In production replace with a dedicated embedding model (e.g. text-embedding-3-small)
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Generate a 64-dimensional semantic embedding vector for this text as a JSON array of floats between -1 and 1. Return ONLY the JSON array, nothing else.\n\nText: ${text.slice(0, 500)}`,
    }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    // Fallback: return zero vector
    return new Array(64).fill(0);
  }
  return JSON.parse(arrayMatch[0]) as number[];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
