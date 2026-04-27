'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';
import ExamModal from './ExamModal';
import AnswerSubmitModal from './AnswerSubmitModal';

interface Submission {
  id: string; status: string; aiScore: number | null; examScore: number | null; finalScore: number | null;
}
interface Consultation {
  id: string; title: string; description: string; status: string; difficulty: string;
  domain?: { name: string; icon: string; color: string };
  user: { id: string; name: string };
  aiAnalysis?: { detectedTopic: string; confidence: number };
  submissions: Submission[];
}
interface Targeted {
  routingId: string;
  similarityScore: number;
  rank: number;
  accepted: boolean | null;
  consultation: Consultation;
  mySubmission: Submission | null;
}

interface ChatRoomInfo { id: string; consultationId: string; userId: string; }
interface ExamInfo { consultationId: string; expertId: string; submissionId: string; }

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  intermediate: { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8' },
  advanced:     { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  expert:       { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
};

export default function ExpertDashboard() {
  const { expert } = useAuth();
  const [items, setItems] = useState<Targeted[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<ChatRoomInfo | null>(null);
  const [activeExam, setActiveExam] = useState<ExamInfo | null>(null);
  const [activeSubmit, setActiveSubmit] = useState<{ id: string; title: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/expert/targeted');
    if (res.ok) {
      const data = await res.json();
      setItems(data.targeted ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAccept(routingId: string, accepted: boolean) {
    setProcessingId(routingId);
    await fetch('/api/expert/targeted', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routingId, accepted }),
    });
    setProcessingId(null);
    load();
  }

  async function openChat(consultationId: string, userId: string) {
    const res = await fetch('/api/chat/rooms?consultationId=' + consultationId);
    if (res.ok) {
      const data = await res.json();
      if (data.room) setActiveChat({ id: data.room.id, consultationId, userId });
    }
  }

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton" />)}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {activeChat && <ChatInterface roomId={activeChat.id} onClose={() => setActiveChat(null)} />}
      {activeSubmit && (
        <AnswerSubmitModal
          consultationId={activeSubmit.id}
          consultationTitle={activeSubmit.title}
          onClose={() => setActiveSubmit(null)}
          onSubmitted={() => { setActiveSubmit(null); load(); }}
        />
      )}
      {activeExam && expert && (
        <ExamModal
          consultationId={activeExam.consultationId}
          expertId={activeExam.expertId}
          submissionId={activeExam.submissionId}
          onClose={() => { setActiveExam(null); load(); }}
          onDone={({ chatRoomId }) => {
            setActiveExam(null);
            if (chatRoomId) setActiveChat({ id: chatRoomId, consultationId: activeExam.consultationId, userId: '' });
            load();
          }}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold gradient-text">Expert Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Questions matched to your expertise — {expert?.domain?.name}
        </p>
      </div>

      {/* Summary stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Targeted', value: items.length, color: '#6366f1', icon: '🎯' },
            { label: 'Accepted', value: items.filter(i => i.accepted === true).length, color: '#34d399', icon: '✓' },
            { label: 'Submitted', value: items.filter(i => i.mySubmission).length, color: '#fbbf24', icon: '📝' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${s.color}20` }}>
                {s.icon}
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No targeted questions yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            You'll be notified when questions match your domain
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <TargetedCard
              key={item.routingId}
              item={item}
              processing={processingId === item.routingId}
              onAccept={accepted => handleAccept(item.routingId, accepted)}
              onOpenChat={() => openChat(item.consultation.id, item.consultation.user.id)}
              onTakeExam={() => {
                if (item.mySubmission && expert) {
                  setActiveExam({ consultationId: item.consultation.id, expertId: expert.id, submissionId: item.mySubmission.id });
                }
              }}
              onSubmitAnswer={() => setActiveSubmit({ id: item.consultation.id, title: item.consultation.title })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TargetedCard({ item, processing, onAccept, onOpenChat, onTakeExam, onSubmitAnswer }: {
  item: Targeted;
  processing: boolean;
  onAccept: (accepted: boolean) => void;
  onOpenChat: () => void;
  onTakeExam: () => void;
  onSubmitAnswer: () => void;
}) {
  const { consultation, mySubmission, similarityScore, rank, accepted } = item;
  const hasChatAccess = mySubmission && (mySubmission.examScore ?? 0) >= 60;
  const canTakeExam = accepted && mySubmission && !mySubmission.examScore;
  const canSubmitAnswer = accepted && !mySubmission;
  const diffStyle = DIFFICULTY_STYLE[consultation.difficulty] ?? DIFFICULTY_STYLE.intermediate;

  return (
    <div className="card transition-all">
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {consultation.title}
              </h3>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {consultation.description}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Match</div>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {(similarityScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {consultation.domain && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {consultation.domain.icon} {consultation.domain.name}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-lg capitalize"
              style={{ background: diffStyle.bg, color: diffStyle.color }}>
              {consultation.difficulty}
            </span>
          </div>

          {/* My submission info */}
          {mySubmission && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-4 text-sm flex-wrap"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>My submission:</span>
              <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                {mySubmission.status}
              </span>
              {mySubmission.aiScore != null && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI: {mySubmission.aiScore}</span>
              )}
              {mySubmission.examScore != null && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Exam: {mySubmission.examScore}</span>
              )}
              {mySubmission.finalScore != null && (
                <span className="text-xs font-bold" style={{ color: '#34d399' }}>Final: {mySubmission.finalScore}</span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {accepted === null ? (
              <>
                <button onClick={() => onAccept(true)} disabled={processing}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                  ✓ Accept
                </button>
                <button onClick={() => onAccept(false)} disabled={processing}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Decline
                </button>
              </>
            ) : accepted ? (
              <span className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                ✓ Accepted
              </span>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                Declined
              </span>
            )}

            {canSubmitAnswer && (
              <button onClick={onSubmitAnswer}
                className="ms-auto px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                ✍️ Submit Answer
              </button>
            )}
            {canTakeExam && (
              <button onClick={onTakeExam}
                className="ms-auto px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                🧪 Take Exam
              </button>
            )}
            {hasChatAccess && (
              <button onClick={onOpenChat}
                className="ms-auto px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                💬 Open Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
