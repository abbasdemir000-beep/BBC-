import { callOpenRouter } from './openrouter';
import {
  smartClassify, smartEvaluate, smartGenerateOpenExam,
  type SmartClassification, type SmartEvaluation, type OpenExam,
} from './smartEngine';

export async function aiClassify(text: string): Promise<SmartClassification> {
  const fallback = smartClassify(text);
  if (!process.env.OPENROUTER_API_KEY) return fallback;

  try {
    const system = `You are an expert question classifier for a knowledge marketplace.
Classify the question and return ONLY valid JSON (no markdown, no explanation):
{
  "domain": string (medicine|engineering|mathematics|physics|computer-science|law|business|chemistry|biology|education|psychology|architecture|economics|nutrition|sports|environmental|philosophy|history|arts|linguistics),
  "subDomain": string,
  "topic": string,
  "questionType": "explanation"|"problem_solving"|"advice"|"diagnosis"|"review",
  "difficulty": "beginner"|"intermediate"|"advanced"|"expert",
  "confidence": number (0-1),
  "reasoning": string (1-2 sentences),
  "safetyFlags": string[],
  "isSafe": boolean,
  "keywords": string[] (max 8)
}`;
    const raw = await callOpenRouter(text, system);
    const parsed = JSON.parse(raw.trim().replace(/^```json\s*|```$/g, ''));
    if (!parsed.domain || !parsed.questionType) return fallback;
    return { ...fallback, ...parsed } as SmartClassification;
  } catch {
    return fallback;
  }
}

export async function aiEvaluate(question: string, answer: string, domain: string): Promise<SmartEvaluation> {
  const fallback = smartEvaluate(question, answer, domain);
  if (!process.env.OPENROUTER_API_KEY) return fallback;

  try {
    const system = `You are a strict but fair expert evaluator for a knowledge marketplace.
Evaluate the expert's answer and return ONLY valid JSON (no markdown):
{
  "accuracyScore": number (0-100),
  "reasoningScore": number (0-100),
  "completenessScore": number (0-100),
  "clarityScore": number (0-100),
  "aiScore": number (0-100, weighted: accuracy×0.35 + reasoning×0.30 + completeness×0.20 + clarity×0.15),
  "feedback": string (2-3 constructive sentences),
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (0-3 items)
}`;
    const raw = await callOpenRouter(
      `Domain: ${domain}\nQuestion: ${question}\nAnswer: ${answer}`,
      system,
    );
    const parsed = JSON.parse(raw.trim().replace(/^```json\s*|```$/g, ''));
    if (typeof parsed.aiScore !== 'number') return fallback;
    return parsed as SmartEvaluation;
  } catch {
    return fallback;
  }
}

export async function aiGenerateExam(
  topic: string, domain: string, difficulty: string,
  title: string, description: string,
): Promise<OpenExam> {
  const fallback = smartGenerateOpenExam(topic, domain, difficulty);
  if (!process.env.OPENROUTER_API_KEY) return fallback;

  try {
    const system = `You are an expert exam author for a knowledge marketplace.
Generate exactly 3 open-ended short-answer questions to test expert knowledge.
Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "id": "q1",
      "question": string,
      "hint": string,
      "keywords": string[] (8-12 key terms a good answer must contain),
      "points": number (33 for q1 and q2, 34 for q3),
      "category": string
    }
  ]
}
Questions must be specific to the consultation context, practical, and at ${difficulty} difficulty.`;
    const raw = await callOpenRouter(
      `Topic: ${topic}\nDomain: ${domain}\nDifficulty: ${difficulty}\nConsultation: ${title} — ${description}`,
      system,
    );
    const parsed = JSON.parse(raw.trim().replace(/^```json\s*|```$/g, ''));
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return fallback;
    return { ...fallback, questions: parsed.questions };
  } catch {
    return fallback;
  }
}
