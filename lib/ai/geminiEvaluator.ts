import { getAnalysisModel, isGeminiEnabled } from './gemini';
import { smartEvaluate } from './smartEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiEvalResult {
  accuracyScore: number;      // 0-100
  reasoningScore: number;     // 0-100
  completenessScore: number;  // 0-100
  clarityScore: number;       // 0-100
  aiScore: number;            // weighted composite 0-100
  feedback: string;           // Detailed feedback for the expert
  strengths: string[];        // What the answer did well
  improvements: string[];     // What could be improved
  confidenceInAnswer: number; // 0-1: how confident Gemini is in its own scoring
  modelUsed: string;
}

// Weights matching the competition scoring formula
const WEIGHTS = { accuracy: 0.35, reasoning: 0.30, completeness: 0.20, clarity: 0.15 };

// ─── Gemini Evaluator ─────────────────────────────────────────────────────────

export async function geminiEvaluate(
  submission: string,
  consultationText: string,
  domain: string,
  difficulty: string,
): Promise<GeminiEvalResult> {

  if (!isGeminiEnabled()) {
    const fallback = smartEvaluate(submission, domain);
    return {
      accuracyScore: fallback.accuracyScore,
      reasoningScore: fallback.reasoningScore,
      completenessScore: fallback.completenessScore,
      clarityScore: fallback.clarityScore,
      aiScore: fallback.aiScore,
      feedback: 'Evaluated by heuristic engine (Gemini not configured).',
      strengths: [],
      improvements: [],
      confidenceInAnswer: 0.6,
      modelUsed: 'smart-engine-fallback',
    };
  }

  const model = getAnalysisModel();

  const prompt = `
You are a senior domain expert and academic evaluator for BBC KnowledgeMarket.

Evaluate the EXPERT ANSWER to the ORIGINAL QUESTION. Score each dimension from 0 to 100.

Domain: ${domain} | Difficulty: ${difficulty}

Scoring Dimensions:
- accuracyScore (0-100): Factual correctness, domain expertise demonstrated
- reasoningScore (0-100): Logic quality, depth of explanation, use of evidence
- completenessScore (0-100): Does it fully address all aspects of the question?
- clarityScore (0-100): Readability, structure, appropriate language level

Return this exact JSON schema:
{
  "accuracyScore": number,
  "reasoningScore": number,
  "completenessScore": number,
  "clarityScore": number,
  "aiScore": number (weighted: accuracy*0.35 + reasoning*0.30 + completeness*0.20 + clarity*0.15),
  "feedback": "string (3-5 sentences of constructive feedback for the expert)",
  "strengths": ["2-4 specific strengths of this answer"],
  "improvements": ["2-4 specific areas to improve"],
  "confidenceInAnswer": number (0.0-1.0, how confident you are in your own scoring accuracy)
}

ORIGINAL QUESTION:
"""
${consultationText}
"""

EXPERT ANSWER:
"""
${submission}
"""

Return only the JSON object.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    const accuracy     = clamp(Number(parsed.accuracyScore ?? 0));
    const reasoning    = clamp(Number(parsed.reasoningScore ?? 0));
    const completeness = clamp(Number(parsed.completenessScore ?? 0));
    const clarity      = clamp(Number(parsed.clarityScore ?? 0));
    const aiScore = accuracy * WEIGHTS.accuracy
                  + reasoning * WEIGHTS.reasoning
                  + completeness * WEIGHTS.completeness
                  + clarity * WEIGHTS.clarity;

    return {
      accuracyScore: accuracy,
      reasoningScore: reasoning,
      completenessScore: completeness,
      clarityScore: clarity,
      aiScore: Math.round(aiScore),
      feedback: parsed.feedback ?? '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      confidenceInAnswer: Math.min(1, Math.max(0, Number(parsed.confidenceInAnswer ?? 0.8))),
      modelUsed: 'gemini-1.5-pro',
    };
  } catch (err) {
    console.error('[geminiEvaluate] error, falling back:', err);
    const fallback = smartEvaluate(submission, domain);
    return {
      accuracyScore: fallback.accuracyScore,
      reasoningScore: fallback.reasoningScore,
      completenessScore: fallback.completenessScore,
      clarityScore: fallback.clarityScore,
      aiScore: fallback.aiScore,
      feedback: 'Evaluated by heuristic engine (Gemini error).',
      strengths: [],
      improvements: [],
      confidenceInAnswer: 0.6,
      modelUsed: 'smart-engine-fallback',
    };
  }
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}
