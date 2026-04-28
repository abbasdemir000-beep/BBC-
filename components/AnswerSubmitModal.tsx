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
    if (!expert) {
      setError('No expert profile linked to your account. Please log out and log in again.');
      return;
    }
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
    <div className="modal-backdrop">
      <div className="modal-panel w-full max-w-2xl">
        <div className="modal-header">
          <div>
            <h2 className="text-white font-bold">✍️ Submit Your Answer</h2>
            <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{consultationTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Your Answer *
            </label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              rows={8} required minLength={20}
              placeholder="Provide a detailed, evidence-based answer. The AI will evaluate your accuracy, reasoning, completeness, and clarity…"
              className="input resize-none"
            />
            <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{content.length} characters</div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Reasoning & References (optional)
            </label>
            <textarea
              value={reasoning} onChange={e => setReasoning(e.target.value)}
              rows={3}
              placeholder="Cite any references, studies, or guidelines you used…"
              className="input resize-none"
            />
          </div>
          <div className="rounded-xl p-3 text-xs"
            style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: '#9a7a2e' }}>
            <strong>Tips for high scores:</strong> Use domain-specific terminology, cite evidence, structure your answer clearly, and be comprehensive.
          </div>
          {error && (
            <div className="rounded-xl p-3 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" disabled={submitting || content.length < 20} className="btn-primary flex-1 py-3">
              {submitting ? 'Submitting…' : 'Submit Answer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
