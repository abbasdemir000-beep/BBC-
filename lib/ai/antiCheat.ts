export interface AntiCheatResult {
  aiGeneratedProb: number;
  plagiarismScore: number;
  similarityFlag: boolean;
  anomalyFlags: string[];
  isFlagged: boolean;
  riskScore: number;
  action: 'pass' | 'flag' | 'warn' | 'disqualify';
}

// Signals that suggest AI-generated text (no external API needed)
const AI_SIGNALS = [
  /\bIn conclusion\b/i, /\bIt is important to note\b/i, /\bAs an AI\b/i,
  /\bCertainly!\b/i, /\bAbsolutely!\b/i, /\bGreat question\b/i,
  /\bIn summary\b/i, /\bFirstly\b/i,
  /\bI hope this helps\b/i, /\bPlease note that\b/i,
];

export async function runAntiCheat(
  submissionText: string,
  _expertId: string,
  previousSubmissions: string[],
  timeSpentSeconds: number
): Promise<AntiCheatResult> {
  const anomalyFlags: string[] = [];

  // 1. Time anomaly
  const wordCount = submissionText.split(/\s+/).length;
  const wordsPerMinute = timeSpentSeconds > 0 ? (wordCount / timeSpentSeconds) * 60 : 9999;
  if (timeSpentSeconds > 0 && timeSpentSeconds < 15) anomalyFlags.push('submission_too_fast');
  if (wordsPerMinute > 250) anomalyFlags.push('typing_speed_anomaly');

  // 2. Heuristic AI-generated detection (no API)
  const aiSignalHits = AI_SIGNALS.filter(r => r.test(submissionText)).length;
  const aiGeneratedProb = Math.min(0.95, aiSignalHits * 0.18);
  if (aiGeneratedProb > 0.5) anomalyFlags.push('likely_ai_generated');

  // 3. Sentence uniformity (AI text has very uniform sentence lengths)
  const sentences = submissionText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 4) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length;
    if (variance < 3 && sentences.length > 5) anomalyFlags.push('uniform_sentence_structure');
  }

  // 4. Similarity detection (Jaccard)
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

  // 5. Composite risk
  const riskScore = Math.min(1,
    aiGeneratedProb * 0.45 +
    plagiarismScore * 0.35 +
    (anomalyFlags.filter(f => ['submission_too_fast', 'typing_speed_anomaly', 'uniform_sentence_structure'].includes(f)).length * 0.07)
  );

  let action: AntiCheatResult['action'] = 'pass';
  let isFlagged = false;
  if (riskScore > 0.8)      { action = 'disqualify'; isFlagged = true; }
  else if (riskScore > 0.6) { action = 'flag';       isFlagged = true; }
  else if (riskScore > 0.4) { action = 'warn'; }

  return { aiGeneratedProb, plagiarismScore, similarityFlag, anomalyFlags, isFlagged, riskScore, action };
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}
