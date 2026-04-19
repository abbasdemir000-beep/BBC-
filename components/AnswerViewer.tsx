'use client';
import { useEffect, useState } from 'react';

interface Submission {
  id: string; content: string; reasoning?: string; status: string;
  aiScore: number | null; examScore: number | null; finalScore: number | null; userRating: number | null;
  accuracyScore: number | null; reasoningScore: number | null; completenessScore: number | null; clarityScore: number | null;
  expert: { id: string; name: string; rating: number; domain?: { name: string; icon: string } };
  examResult?: { score: number; feedback: string };
}

interface Props {
  consultationId: string;
  onClose: () => void;
}

export default function AnswerViewer({ consultationId, onClose }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/submissions?consultationId=${consultationId}`)
      .then(r => r.json())
      .then(d => { setSubmissions(d.submissions ?? []); setLoading(false); });
  }, [consultationId]);

  async function submitRating(submissionId: string, r: number) {
    setSubmitting(true);
    await fetch(`/api/submissions/${submissionId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: r }),
    });
    setRatingDone(true); setSubmitting(false);
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, userRating: r } : s));
    if (selected?.id === submissionId) setSelected(s => s ? { ...s, userRating: r } : s);
  }

  const scoreBar = (label: string, val: number | null, color: string) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold text-[var(--text-secondary)]">{val ?? 0}</span>
      </div>
      <div className="h-1.5 bg-[var(--bg)] rounded-full">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${val ?? 0}%` }} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm" dir="auto">
      <div className="m-auto w-full max-w-4xl bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold">Expert Answers ({submissions.length})</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-[var(--text-muted)]">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium">No answers yet</p>
            <p className="text-sm mt-1">Experts are working on your question</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar list */}
            <div className="w-64 border-r border-[var(--border)] overflow-y-auto flex-shrink-0">
              {submissions.map((s, i) => (
                <button key={s.id} onClick={() => { setSelected(s); setRating(s.userRating ?? 0); setRatingDone(!!s.userRating); }}
                  className={`w-full text-left p-4 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-all ${selected?.id === s.id ? 'bg-brand-50 border-l-4 border-l-brand-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] truncate">{s.expert.name}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{s.expert.domain?.icon} {s.expert.domain?.name}</div>
                    </div>
                  </div>
                  {s.finalScore != null && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-600">Score: {s.finalScore.toFixed(0)}</span>
                    </div>
                  )}
                  {s.userRating && <div className="text-xs text-amber-500 mt-1">{'⭐'.repeat(s.userRating)}</div>}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selected ? (
                <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                  <div className="text-center"><div className="text-4xl mb-2">👈</div><p>Select an answer to read</p></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Expert header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {selected.expert.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{selected.expert.name}</div>
                      <div className="text-sm text-[var(--text-muted)]">{selected.expert.domain?.icon} {selected.expert.domain?.name} · ⭐ {selected.expert.rating.toFixed(1)}</div>
                    </div>
                    <div className={`ms-auto px-3 py-1 rounded-xl text-xs font-semibold ${selected.status === 'rated' ? 'bg-green-100 text-green-700' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>
                      {selected.status}
                    </div>
                  </div>

                  {/* Answer content */}
                  <div className="bg-[var(--bg)] rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Answer</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                  </div>

                  {selected.reasoning && (
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Reasoning & References</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selected.reasoning}</p>
                    </div>
                  )}

                  {/* AI Scores */}
                  <div className="card space-y-3">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">AI Evaluation</h3>
                    {scoreBar('Accuracy', selected.accuracyScore, 'bg-blue-500')}
                    {scoreBar('Reasoning', selected.reasoningScore, 'bg-purple-500')}
                    {scoreBar('Completeness', selected.completenessScore, 'bg-green-500')}
                    {scoreBar('Clarity', selected.clarityScore, 'bg-amber-500')}
                    <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">AI Score</span>
                      <span className="text-2xl font-black text-brand-600">{selected.aiScore?.toFixed(0) ?? '—'}</span>
                    </div>
                  </div>

                  {/* Exam result */}
                  {selected.examResult && (
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Exam Result</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-emerald-700">{selected.examResult.score}%</span>
                        <p className="text-sm text-emerald-700">{selected.examResult.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="card">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Rate this answer</h3>
                    {ratingDone ? (
                      <div className="text-center py-4">
                        <div className="text-3xl mb-1">{'⭐'.repeat(rating)}</div>
                        <p className="text-sm text-[var(--text-muted)]">Thanks for rating! {rating}/5 stars</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} disabled={submitting}
                            onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                            onClick={() => { setRating(star); submitRating(selected.id, star); }}
                            className={`text-3xl transition-transform hover:scale-110 ${star <= (hovered || rating) ? 'text-amber-400' : 'text-[var(--border)]'}`}>
                            ⭐
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
