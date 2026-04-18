'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  consultationId: string;
  consultationTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function AnswerSubmitModal({ consultationId, consultationTitle, onClose, onSubmitted }: Props) {
  const { expert } = useAuth();
  const [content, setContent] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expert) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, expertId: expert.id, content, reasoning, timeSpentSeconds: 120 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting answer');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">Submit Your Answer</h2>
            <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{consultationTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Your Answer *</label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              rows={8} required minLength={20}
              placeholder="Provide a detailed, evidence-based answer. The AI will evaluate your accuracy, reasoning, completeness, and clarity…"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <div className="text-xs text-slate-400 mt-1 text-right">{content.length} characters</div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Reasoning & References (optional)</label>
            <textarea
              value={reasoning} onChange={e => setReasoning(e.target.value)}
              rows={3}
              placeholder="Cite any references, studies, or guidelines you used…"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <strong>Tips for high scores:</strong> Use domain-specific terminology, cite evidence, structure your answer clearly, and be comprehensive.
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" disabled={submitting || content.length < 20}
              className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-purple-700 disabled:opacity-60 transition-all">
              {submitting ? 'Submitting…' : 'Submit Answer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
