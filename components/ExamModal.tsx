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
  const [timeLeft, setTimeLeft] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; chatRoomId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const startRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId }),
    })
      .then(r => r.json())
      .then(data => {
        const questions = JSON.parse(data.exam.questions ?? '[]') as OpenQuestion[];
        setExam({ id: data.exam.id, timeLimitSecs: 25, questions, topic: data.topic });
        setLoading(false);
        setTimeLeft(25);
      });
  }, [consultationId]);

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
        body: JSON.stringify({ expertId, submissionId, answers, timeTakenSecs: timeTaken }),
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
        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Generating your exam…</p>
      </div>
    </Modal>
  );

  if (result) return (
    <Modal onClose={() => { onDone({ score: result.score, chatRoomId: result.chatRoomId }); onClose(); }}>
      <div className="text-center space-y-4 py-4">
        <div className={`text-6xl ${result.score >= 60 ? '' : 'grayscale'}`}>
          {result.score >= 80 ? '🏆' : result.score >= 60 ? '✅' : '❌'}
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {result.score >= 60 ? 'Exam Passed!' : 'Exam Failed'}
        </h2>
        <div className={`text-5xl font-black ${result.score >= 60 ? 'text-green-400' : 'text-red-400'}`}>
          {result.score}%
        </div>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>{result.feedback}</p>
        {result.score >= 60 && result.chatRoomId && (
          <div className="rounded-2xl p-4 text-sm font-medium"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            💬 Chat with the asker is now unlocked!
          </div>
        )}
        {result.score < 60 && (
          <div className="rounded-2xl p-4 text-sm"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
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

  const pct = (timeLeft / 25) * 100;
  const urgentColor = timeLeft <= 8 ? 'from-red-500 to-red-600' : timeLeft <= 15 ? 'from-amber-500 to-amber-600' : 'from-brand-500 to-purple-600';

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Domain Expertise Exam</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Topic: {exam?.topic} · Answer briefly in your own words</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${urgentColor} flex flex-col items-center justify-center text-white shadow flex-shrink-0`}>
            <span className="text-xl font-black leading-none">{timeLeft}</span>
            <span className="text-xs opacity-80">sec</span>
          </div>
        </div>
        {/* Timer bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
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
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{q.hint}</p>
              </div>
            </div>
            <textarea
              value={answers[q.id] ?? ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Type your answer here…"
              rows={3}
              className="input resize-none"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg overflow-hidden rounded-[1.25rem]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 25px 80px rgba(0,0,0,0.4)' }}>
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-5 py-3 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">🧪 Expert Examination</span>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
