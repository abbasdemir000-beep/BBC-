export type { OpenExamQuestion as ExamQuestion, OpenExam as GeneratedExam } from './smartEngine';
export { smartGenerateOpenExam as generateExam } from './smartEngine';

export async function gradeOpenExam(
  questions: Array<{ id: string; keywords: string[]; points: number }>,
  answers: Record<string, string>
): Promise<{ score: number; feedback: string; breakdown: Record<string, { score: number; points: number; feedback: string }> }> {
  const { scoreOpenAnswer } = await import('./smartEngine');
  const breakdown: Record<string, { score: number; points: number; feedback: string }> = {};
  let totalWeighted = 0;
  let totalPoints = 0;

  for (const q of questions) {
    const answer = answers[q.id] ?? '';
    const pct = scoreOpenAnswer(answer, q.keywords);
    const earned = Math.round((pct / 100) * q.points);
    totalWeighted += earned;
    totalPoints += q.points;
    const fb = pct >= 80 ? 'Excellent answer — strong use of key concepts.'
      : pct >= 60 ? 'Good answer — covers most key concepts.'
      : pct >= 40 ? 'Partial answer — missing some important concepts.'
      : 'Insufficient — answer lacks key domain concepts.';
    breakdown[q.id] = { score: pct, points: earned, feedback: fb };
  }

  const score = totalPoints > 0 ? Math.round((totalWeighted / totalPoints) * 100) : 0;
  const overallFb = score >= 80 ? 'Outstanding performance — deep domain knowledge demonstrated.'
    : score >= 60 ? 'Competent — you demonstrated solid understanding.'
    : score >= 40 ? 'Partial knowledge — more depth needed.'
    : 'Insufficient knowledge for this domain.';

  return { score, feedback: overallFb, breakdown };
}
