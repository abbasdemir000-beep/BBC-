import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AntiCheatResult {
  aiGeneratedProb: number;
  plagiarismScore: number;
  similarityFlag: boolean;
  anomalyFlags: string[];
  isFlagged: boolean;
  riskScore: number;
  action: 'pass' | 'flag' | 'warn' | 'disqualify';
}

export async function runAntiCheat(
  submissionText: string,
  expertId: string,
  previousSubmissions: string[],
  timeSpentSeconds: number
): Promise<AntiCheatResult> {
  const anomalyFlags: string[] = [];

  // 1. Time anomaly: impossibly fast submission
  const wordCount = submissionText.split(/\s+/).length;
  const wordsPerMinute = (wordCount / timeSpentSeconds) * 60;
  if (timeSpentSeconds < 30) anomalyFlags.push('submission_too_fast');
  if (wordsPerMinute > 200) anomalyFlags.push('typing_speed_anomaly');

  // 2. AI-generated text detection via Claude
  let aiGeneratedProb = 0;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analyze if this text is AI-generated. Return ONLY JSON: {"probability": 0.0-1.0, "signals": ["signal1"]}

Text: ${submissionText.slice(0, 1000)}`,
      }],
    });
    const raw = (response.content[0] as { type: string; text: string }).text;
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as { probability: number; signals: string[] };
      aiGeneratedProb = parsed.probability;
      if (aiGeneratedProb > 0.8) anomalyFlags.push('likely_ai_generated');
    }
  } catch {
    // non-fatal
  }

  // 3. Similarity detection against previous submissions
  let plagiarismScore = 0;
  let similarityFlag = false;
  for (const prev of previousSubmissions) {
    const sim = jaccardSimilarity(submissionText, prev);
    if (sim > plagiarismScore) plagiarismScore = sim;
  }
  if (plagiarismScore > 0.6) {
    similarityFlag = true;
    anomalyFlags.push('high_similarity_detected');
  }

  // 4. Composite risk score
  const riskScore = Math.min(
    1,
    aiGeneratedProb * 0.5 +
    plagiarismScore * 0.3 +
    (anomalyFlags.filter(f => f !== 'likely_ai_generated' && f !== 'high_similarity_detected').length * 0.1)
  );

  let action: AntiCheatResult['action'] = 'pass';
  let isFlagged = false;
  if (riskScore > 0.8) { action = 'disqualify'; isFlagged = true; }
  else if (riskScore > 0.6) { action = 'flag'; isFlagged = true; }
  else if (riskScore > 0.4) { action = 'warn'; }

  return { aiGeneratedProb, plagiarismScore, similarityFlag, anomalyFlags, isFlagged, riskScore, action };
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
