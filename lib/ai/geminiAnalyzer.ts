import { getAnalysisModel, getEmbeddingModel, isGeminiEnabled } from './gemini';
import { smartClassify, smartEmbedding } from './smartEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiClassifyResult {
  detectedDomain: string;
  detectedSubDomain: string;
  detectedTopic: string;
  questionType: 'explanation' | 'problem_solving' | 'advice' | 'diagnosis' | 'review';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;       // 0-1
  reasoning: string;
  safetyFlags: string[];
  isSafe: boolean;
  priorityLevel: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  keywords: string[];
  language: 'en' | 'ar' | 'ku' | 'unknown';
  modelUsed: string;
}

// ─── Gemini Analyzer ──────────────────────────────────────────────────────────

export async function geminiAnalyze(text: string): Promise<GeminiClassifyResult> {
  if (!isGeminiEnabled()) {
    const fallback = smartClassify(text);
    return {
      detectedDomain: fallback.domain,
      detectedSubDomain: fallback.subDomain,
      detectedTopic: fallback.topic,
      questionType: fallback.questionType,
      difficulty: fallback.difficulty,
      confidence: fallback.confidence,
      reasoning: fallback.reasoning,
      safetyFlags: fallback.safetyFlags,
      isSafe: fallback.isSafe,
      priorityLevel: 2,
      keywords: [],
      language: 'en',
      modelUsed: 'smart-engine-fallback',
    };
  }

  const model = getAnalysisModel();

  const prompt = `
Analyze this consultation request and return a JSON object matching this exact schema:

{
  "detectedDomain": "string (e.g. medicine, engineering, law, business, technology, science, education, finance)",
  "detectedSubDomain": "string (specific sub-field within the domain)",
  "detectedTopic": "string (specific topic within the sub-domain)",
  "questionType": "explanation | problem_solving | advice | diagnosis | review",
  "difficulty": "beginner | intermediate | advanced | expert",
  "confidence": number (0.0 to 1.0),
  "reasoning": "string (2-3 sentences explaining your classification)",
  "safetyFlags": ["array of safety concerns if any, empty array if none"],
  "isSafe": boolean,
  "priorityLevel": 1 | 2 | 3,
  "keywords": ["array of 5-10 key terms extracted from the text"],
  "language": "en | ar | ku | unknown"
}

Priority levels:
- 3 (HIGH): Medical emergency, legal crisis, urgent technical failure
- 2 (MEDIUM): Standard professional consultation
- 1 (LOW): General knowledge or educational question

CONSULTATION TEXT:
"""
${text}
"""

Return only the JSON object, no extra text.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    return {
      detectedDomain: parsed.detectedDomain ?? 'general',
      detectedSubDomain: parsed.detectedSubDomain ?? 'general',
      detectedTopic: parsed.detectedTopic ?? 'general',
      questionType: parsed.questionType ?? 'explanation',
      difficulty: parsed.difficulty ?? 'intermediate',
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.7))),
      reasoning: parsed.reasoning ?? '',
      safetyFlags: Array.isArray(parsed.safetyFlags) ? parsed.safetyFlags : [],
      isSafe: parsed.isSafe !== false,
      priorityLevel: ([1, 2, 3].includes(parsed.priorityLevel) ? parsed.priorityLevel : 2) as 1 | 2 | 3,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      language: parsed.language ?? 'en',
      modelUsed: 'gemini-1.5-pro',
    };
  } catch (err) {
    console.error('[geminiAnalyze] parse error, falling back:', err);
    const fallback = smartClassify(text);
    return {
      detectedDomain: fallback.domain,
      detectedSubDomain: fallback.subDomain,
      detectedTopic: fallback.topic,
      questionType: fallback.questionType,
      difficulty: fallback.difficulty,
      confidence: fallback.confidence,
      reasoning: fallback.reasoning,
      safetyFlags: fallback.safetyFlags,
      isSafe: fallback.isSafe,
      priorityLevel: 2,
      keywords: [],
      language: 'en',
      modelUsed: 'smart-engine-fallback',
    };
  }
}

// ─── Gemini Embedding ─────────────────────────────────────────────────────────

export async function geminiEmbed(text: string): Promise<number[]> {
  if (!isGeminiEnabled()) {
    return smartEmbedding(text);
  }
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error('[geminiEmbed] error, falling back:', err);
    return smartEmbedding(text);
  }
}
