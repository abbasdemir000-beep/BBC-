import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];       // MCQ only
  correctAnswer: string;
  explanation: string;
  points: number;
  category: 'definition' | 'mechanism' | 'application' | 'analysis' | 'synthesis';
}

export interface GeneratedExam {
  questions: ExamQuestion[];
  totalPoints: number;
  timeLimitSecs: number;
  coverageAreas: string[];
}

export async function generateExam(
  topic: string,
  subTopic: string,
  difficulty: string,
  questionCount: number = 10
): Promise<GeneratedExam> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are an expert exam designer. Generate a rigorous mini-exam.
Return ONLY valid JSON matching:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "...",
      "points": 10,
      "category": "definition|mechanism|application|analysis|synthesis"
    }
  ],
  "totalPoints": 100,
  "timeLimitSecs": 600,
  "coverageAreas": ["area1", "area2"]
}
Mix 70% MCQ and 30% short_answer. Cover: definitions, causes, mechanisms, applications, edge cases.
Difficulty: ${difficulty}. Questions: ${questionCount}.`,
    messages: [{
      role: 'user',
      content: `Generate exam for:\nTopic: ${topic}\nSub-topic: ${subTopic}`,
    }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Exam generation returned invalid JSON');
  return JSON.parse(jsonMatch[0]) as GeneratedExam;
}

export async function gradeExam(
  questions: ExamQuestion[],
  answers: Record<string, string>
): Promise<{ score: number; feedback: string; breakdown: Record<string, { correct: boolean; points: number; explanation: string }> }> {
  const breakdown: Record<string, { correct: boolean; points: number; explanation: string }> = {};
  let earned = 0;
  let total = 0;

  for (const q of questions) {
    total += q.points;
    const submitted = (answers[q.id] || '').trim().toLowerCase();
    const correct = q.correctAnswer.trim().toLowerCase();

    if (q.type === 'mcq') {
      const isCorrect = submitted.startsWith(correct.charAt(0));
      breakdown[q.id] = {
        correct: isCorrect,
        points: isCorrect ? q.points : 0,
        explanation: q.explanation,
      };
      if (isCorrect) earned += q.points;
    } else {
      // Short answer: use AI grading
      const partialCredit = submitted.length > 10 && submitted.includes(correct.split(' ')[0]) ? 0.5 : 0;
      breakdown[q.id] = {
        correct: partialCredit > 0,
        points: Math.round(q.points * partialCredit),
        explanation: q.explanation,
      };
      earned += Math.round(q.points * partialCredit);
    }
  }

  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { score, feedback: `Scored ${earned}/${total} points`, breakdown };
}
