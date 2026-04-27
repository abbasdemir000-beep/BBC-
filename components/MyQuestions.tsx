'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';
import AnswerViewer from './AnswerViewer';

interface Submission {
  id: string; expertId: string; status: string;
  aiScore: number | null; examScore: number | null; finalScore: number | null;
  expert: { name: string; domain?: { name: string; icon: string } };
}
interface ChatRoom { id: string; expertId: string; isActive: boolean; }
interface Consultation {
  id: string; title: string; description: string; status: string;
  difficulty: string; createdAt: string;
  domain?: { name: string; icon: string; color: string };
  submissions: Submission[];
  chatRooms: ChatRoom[];
  _count: { submissions: number };
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(148,163,184,0.1)',  color: '#94a3b8' },
  analyzing: { bg: 'rgba(56,189,248,0.1)',   color: '#38bdf8' },
  routing:   { bg: 'rgba(167,139,250,0.1)',  color: '#a78bfa' },
  active:    { bg: 'rgba(52,211,153,0.1)',   color: '#34d399' },
  examining: { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24' },
  completed: { bg: 'rgba(52,211,153,0.1)',   color: '#34d399' },
  cancelled: { bg: 'rgba(248,113,113,0.1)',  color: '#f87171' },
};

export default function MyQuestions() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [viewingAnswers, setViewingAnswers] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/consultations/mine');
    if (res.ok) setConsultations((await res.json()).consultations ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!user) return (
    <div className="p-8">
      <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-medium">Sign in to see your questions</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton" />)}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {activeChat && <ChatInterface roomId={activeChat} onClose={() => { setActiveChat(null); load(); }} />}
      {viewingAnswers && <AnswerViewer consultationId={viewingAnswers} onClose={() => setViewingAnswers(null)} />}

      <div>
        <h1 className="text-2xl font-bold gradient-text">My Questions</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {consultations.length} question{consultations.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {consultations.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">❓</div>
          <p className="font-medium">No questions yet</p>
          <p className="text-sm mt-1">Go to "Ask Question" to submit your first question</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map(c => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              onOpenChat={setActiveChat}
              onViewAnswers={() => setViewingAnswers(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ consultation: c, onOpenChat, onViewAnswers }: {
  consultation: Consultation;
  onOpenChat: (roomId: string) => void;
  onViewAnswers: () => void;
}) {
  const ss = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending;

  return (
    <div className="card transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: ss.bg, color: ss.color }}>
              {c.status}
            </span>
          </div>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{c.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {c.domain && (
              <span className="text-xs px-2 py-1 rounded-lg"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {c.domain.icon} {c.domain.name}
              </span>
            )}
            <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{c.difficulty}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right space-y-2">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{c._count.submissions}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>answers</div>
          </div>
          {c._count.submissions > 0 && (
            <button onClick={onViewAnswers}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.15)' }}>
              📖 View Answers
            </button>
          )}
        </div>
      </div>

      {/* Expert submissions */}
      {c.submissions.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Expert Answers
          </div>
          {c.submissions.map(sub => {
            const chatRoom = c.chatRooms.find(r => r.expertId === sub.expertId && r.isActive);
            const subSS = STATUS_STYLE[sub.status] ?? STATUS_STYLE.pending;
            return (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {sub.expert.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {sub.expert.name}
                  </div>
                  {sub.expert.domain && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {sub.expert.domain.icon} {sub.expert.domain.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  {sub.aiScore != null && (
                    <span style={{ color: 'var(--text-muted)' }}>AI: <strong style={{ color: 'var(--text-primary)' }}>{sub.aiScore}</strong></span>
                  )}
                  {sub.examScore != null && (
                    <span style={{ color: 'var(--text-muted)' }}>Exam: <strong style={{ color: 'var(--text-primary)' }}>{sub.examScore}</strong></span>
                  )}
                  {sub.finalScore != null && (
                    <span className="font-bold" style={{ color: '#34d399' }}>⭐ {sub.finalScore}</span>
                  )}
                  <span className="px-2 py-0.5 rounded-lg"
                    style={{ background: subSS.bg, color: subSS.color }}>
                    {sub.status}
                  </span>
                </div>
                {chatRoom && (
                  <button onClick={() => onOpenChat(chatRoom.id)}
                    className="ms-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    💬 Chat
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
