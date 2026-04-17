import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface EvaluationResult {
  accuracyScore: number;
  reasoningScore: number;
  completenessScore: number;
  clarityScore: number;
  aiScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export async function evaluateSubmission(
  question: string,
  answer: string,
  domain: string,
  topic: string
): Promise<EvaluationResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are an expert evaluator for a knowledge marketplace in the domain of ${domain}.
Evaluate the answer to a question rigorously and return ONLY valid JSON:
{
  "accuracyScore": 0-100,
  "reasoningScore": 0-100,
  "completenessScore": 0-100,
  "clarityScore": 0-100,
  "aiScore": 0-100,
  "feedback": "concise evaluation",
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"]
}
aiScore = accuracyScore*0.35 + reasoningScore*0.30 + completenessScore*0.20 + clarityScore*0.15
Be strict and objective. Topic context: ${topic}`,
    messages: [{
      role: 'user',
      content: `QUESTION:\n${question}\n\nANSWER:\n${answer}`,
    }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Evaluation returned invalid JSON');
  return JSON.parse(jsonMatch[0]) as EvaluationResult;
}
