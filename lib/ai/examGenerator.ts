// All AI logic moved to smartEngine.ts — no external API calls
export type { SmartExamQuestion as ExamQuestion, SmartExam as GeneratedExam } from './smartEngine';
export { smartGenerateExam as generateExam } from './smartEngine';

export async function gradeExam(
  questions: Array<{ id: string; type: string; correctAnswer: string; points: number; explanation: string }>,
  answers: Record<string, string>
): Promise<{ score: number; feedback: string; breakdown: Record<string, { correct: boolean; points: number; explanation: string }> }> {
  const breakdown: Record<string, { correct: boolean; points: number; explanation: string }> = {};
  let earned = 0, total = 0;

  for (const q of questions) {
    total += q.points;
    const submitted = (answers[q.id] ?? '').trim().toUpperCase().charAt(0);
    const correct   = q.correctAnswer.trim().toUpperCase().charAt(0);
    const isCorrect = submitted === correct;
    breakdown[q.id] = { correct: isCorrect, points: isCorrect ? q.points : 0, explanation: q.explanation };
    if (isCorrect) earned += q.points;
  }

  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { score, feedback: `Scored ${earned}/${total} points (${score}%)`, breakdown };
}
