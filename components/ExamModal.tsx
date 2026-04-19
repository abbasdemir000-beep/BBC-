'use client';
import { useEffect, useRef, useState } from 'react';

interface OpenQuestion {
  id: string;
  question: string;
  hint: string;
  keywords: string[];
  points: number;
  category: string;
}

interface Exam {
  id: string;
  timeLimitSecs: number;
  questions: OpenQuestion[];
  topic: string;
}

interface Props {
  consultationId: string;
  expertId: string;
  submissionId: string;
  onDone: (result: { score: number; chatRoomId?: string }) => void;
  onClose: () => void;
}

export default function ExamModal({ consultationId, expertId, submissionId, onDone, onClose }: Props) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; chatRoomId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const startRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Generate exam
    fetch('/api/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId }),
    })
      .then(r => r.json())
      .then(data => {
        const timeLimitSecs = data.exam.timeLimitSecs ?? 600;
        const questions = JSON.parse(data.exam.questions ?? '[]') as OpenQuestion[];
        setExam({ id: data.exam.id, timeLimitSecs, questions, topic: data.topic });
        setLoading(false);
        setTimeLeft(timeLimitSecs);
      });
  }, [consultationId]);

  // Start countdown when exam loads
  useEffect(() => {
    if (!exam) return;
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.id]);

  async function handleSubmit() {
    if (submitting || !exam) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startRef.current) / 1000);
    try {
      const res = await fetch(`/api/exam/${exam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, answers, timeTakenSecs: timeTaken }),
      });
      const data = await res.json();
      setResult({ score: data.score, feedback: data.feedback, chatRoomId: data.chatRoomId });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <p className="text-slate-600 font-medium">Generating your exam…</p>
      </div>
    </Modal>
  );

  if (result) return (
    <Modal onClose={() => { onDone({ score: result.score, chatRoomId: result.chatRoomId }); onClose(); }}>
      <div className="text-center space-y-4 py-4">
        <div className={`text-6xl ${result.score >= 60 ? '' : 'grayscale'}`}>
          {result.score >= 80 ? '🏆' : result.score >= 60 ? '✅' : '❌'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {result.score >= 60 ? 'Exam Passed!' : 'Exam Failed'}
        </h2>
        <div className={`text-5xl font-black ${result.score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
          {result.score}%
        </div>
        <p className="text-slate-600 text-sm max-w-xs mx-auto">{result.feedback}</p>
        {result.score >= 60 && result.chatRoomId && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 font-medium">
            💬 Chat with the asker is now unlocked!
          </div>
        )}
        {result.score < 60 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
            Score ≥ 60% required to unlock chat. You scored {result.score}%.
          </div>
        )}
        <button
          onClick={() => { onDone({ score: result.score, chatRoomId: result.chatRoomId }); onClose(); }}
          className="w-full py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-purple-700 transition-all"
        >
          {result.chatRoomId ? 'Open Chat →' : 'Close'}
        </button>
      </div>
    </Modal>
  );

  const totalSecs = exam?.timeLimitSecs ?? 600;
  const pct = (timeLeft / totalSecs) * 100;
  const urgentColor = timeLeft <= totalSecs * 0.15 ? 'from-red-500 to-red-600' : timeLeft <= totalSecs * 0.4 ? 'from-amber-500 to-amber-600' : 'from-brand-500 to-purple-600';

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-bold text-slate-900">Domain Expertise Exam</h2>
            <p className="text-xs text-slate-500">Topic: {exam?.topic} · Answer briefly in your own words</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${urgentColor} flex flex-col items-center justify-center text-white shadow flex-shrink-0`}>
            <span className="text-xl font-black leading-none">{timeLeft}</span>
            <span className="text-xs opacity-80">sec</span>
          </div>
        </div>
        {/* Timer bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${urgentColor} transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {exam?.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{q.question}</p>
                <p className="text-xs text-slate-400 mt-0.5 italic">{q.hint}</p>
              </div>
            </div>
            <textarea
              value={answers[q.id] ?? ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Type your answer here…"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-purple-700 disabled:opacity-60 transition-all"
      >
        {submitting ? 'Analyzing answers…' : 'Submit Answers'}
      </button>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-5 py-3 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">🧪 Expert Examination</span>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
