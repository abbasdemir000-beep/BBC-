import { getAnalysisModel, getOrchestratorModel, isGeminiEnabled } from './gemini';
import { runAntiCheat } from './antiCheat';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiAntiCheatResult {
  aiGeneratedProb: number;     // 0-1: probability content is AI-generated
  plagiarismScore: number;     // 0-1: likelihood of copied content
  relevanceScore: number;      // 0-1: how relevant is the answer to the question
  riskScore: number;           // 0-1: overall risk (weighted composite)
  isFlagged: boolean;
  flagReason: string | null;
  status: 'CLEAN' | 'SUSPICIOUS' | 'FLAGGED';
  action: 'pass' | 'flag' | 'warn' | 'disqualify';
  anomalyFlags: string[];
  confidenceReport: string;    // Admin-only summary
  modelUsed: string;
}

// ─── Gemini Anti-Cheat ────────────────────────────────────────────────────────

export async function geminiAntiCheat(
  submission: string,
  consultationText: string,
  expertId: string,
): Promise<GeminiAntiCheatResult> {

  if (!isGeminiEnabled()) {
    const fallback = runAntiCheat(submission, 0);
    return {
      aiGeneratedProb: fallback.aiGeneratedProb,
      plagiarismScore: fallback.plagiarismScore,
      relevanceScore: 0.8,
      riskScore: fallback.riskScore,
      isFlagged: fallback.isFlagged,
      flagReason: fallback.flagReason ?? null,
      status: fallback.isFlagged ? 'FLAGGED' : 'CLEAN',
      action: fallback.action,
      anomalyFlags: fallback.anomalyFlags,
      confidenceReport: 'Analyzed by heuristic engine (Gemini not configured).',
      modelUsed: 'anti-cheat-heuristic-fallback',
    };
  }

  const model = getAnalysisModel();

  const prompt = `
You are an anti-fraud inspector for BBC KnowledgeMarket expert consultation platform.

Analyze the EXPERT SUBMISSION below against the ORIGINAL QUESTION for:
1. AI-Generated Content probability (0-1): Is this clearly written by an AI without human expertise?
2. Plagiarism likelihood (0-1): Does it appear copied/generic without domain-specific insight?
3. Relevance score (0-1): Does the answer directly address the question asked?
4. Anomaly flags: Any suspicious patterns (overly generic, off-topic, contradictory, etc.)

Return this exact JSON schema:
{
  "aiGeneratedProb": number (0.0-1.0),
  "plagiarismScore": number (0.0-1.0),
  "relevanceScore": number (0.0-1.0),
  "riskScore": number (0.0-1.0, weighted: aiProb*0.45 + plagiarism*0.35 + (1-relevance)*0.20),
  "isFlagged": boolean,
  "flagReason": "string or null",
  "status": "CLEAN | SUSPICIOUS | FLAGGED",
  "action": "pass | flag | warn | disqualify",
  "anomalyFlags": ["array of specific issues found"],
  "confidenceReport": "2-3 sentence admin-facing summary of findings"
}

Status thresholds:
- CLEAN: riskScore < 0.35
- SUSPICIOUS: 0.35 <= riskScore < 0.65
- FLAGGED: riskScore >= 0.65

Action thresholds:
- pass: riskScore < 0.35
- warn: 0.35 <= riskScore < 0.50
- flag: 0.50 <= riskScore < 0.70
- disqualify: riskScore >= 0.70

ORIGINAL QUESTION:
"""
${consultationText}
"""

EXPERT SUBMISSION (Expert ID: ${expertId}):
"""
${submission}
"""

Return only the JSON object.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    const aiProb = Math.min(1, Math.max(0, Number(parsed.aiGeneratedProb ?? 0)));
    const plagiarism = Math.min(1, Math.max(0, Number(parsed.plagiarismScore ?? 0)));
    const relevance = Math.min(1, Math.max(0, Number(parsed.relevanceScore ?? 0.8)));
    const risk = Math.min(1, Math.max(0, Number(parsed.riskScore ?? aiProb * 0.45 + plagiarism * 0.35 + (1 - relevance) * 0.20)));

    // If riskScore is high — also trigger function calling to flag in the system
    if (risk >= 0.65) {
      await triggerFraudFunctionCall(expertId, parsed.flagReason ?? 'High risk score detected', risk);
    }

    return {
      aiGeneratedProb: aiProb,
      plagiarismScore: plagiarism,
      relevanceScore: relevance,
      riskScore: risk,
      isFlagged: parsed.isFlagged === true || risk >= 0.50,
      flagReason: parsed.flagReason ?? null,
      status: parsed.status ?? (risk >= 0.65 ? 'FLAGGED' : risk >= 0.35 ? 'SUSPICIOUS' : 'CLEAN'),
      action: parsed.action ?? (risk >= 0.70 ? 'disqualify' : risk >= 0.50 ? 'flag' : risk >= 0.35 ? 'warn' : 'pass'),
      anomalyFlags: Array.isArray(parsed.anomalyFlags) ? parsed.anomalyFlags : [],
      confidenceReport: parsed.confidenceReport ?? '',
      modelUsed: 'gemini-1.5-pro',
    };
  } catch (err) {
    console.error('[geminiAntiCheat] error, falling back:', err);
    const fallback = runAntiCheat(submission, 0);
    return {
      aiGeneratedProb: fallback.aiGeneratedProb,
      plagiarismScore: fallback.plagiarismScore,
      relevanceScore: 0.8,
      riskScore: fallback.riskScore,
      isFlagged: fallback.isFlagged,
      flagReason: fallback.flagReason ?? null,
      status: fallback.isFlagged ? 'FLAGGED' : 'CLEAN',
      action: fallback.action,
      anomalyFlags: fallback.anomalyFlags,
      confidenceReport: 'Analyzed by heuristic engine (Gemini error).',
      modelUsed: 'anti-cheat-heuristic-fallback',
    };
  }
}

// ─── Function Calling: Fraud Trigger ─────────────────────────────────────────
// Demonstrates Gemini function calling — the orchestrator model decides to call
// flag_user_for_fraud when riskScore is critical.

async function triggerFraudFunctionCall(expertId: string, reason: string, riskScore: number): Promise<void> {
  try {
    const model = getOrchestratorModel();
    const severity = riskScore >= 0.85 ? 'critical' : riskScore >= 0.70 ? 'high' : 'medium';

    const chat = model.startChat();
    const result = await chat.sendMessage(
      `An expert submission has been detected with a fraud risk score of ${(riskScore * 100).toFixed(0)}%. ` +
      `Expert ID: ${expertId}. Reason: ${reason}. ` +
      `Please flag this expert for fraud with severity ${severity}.`
    );

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.functionCall?.name === 'flag_user_for_fraud') {
        // Function was called — log it (in production, execute DB update here)
        console.info('[Gemini FunctionCall] flag_user_for_fraud:', JSON.stringify(part.functionCall.args));
      }
    }
  } catch (err) {
    console.warn('[triggerFraudFunctionCall] non-critical error:', err);
  }
}
