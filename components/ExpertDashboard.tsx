'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';
import ExamModal from './ExamModal';
import AnswerSubmitModal from './AnswerSubmitModal';

interface Submission { id: string; status: string; aiScore: number | null; examScore: number | null; finalScore: number | null; }
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
    // Look up chat room for this consultation + expert
    const res = await fetch('/api/chat/rooms?consultationId=' + consultationId);
    if (res.ok) {
      const data = await res.json();
      if (data.room) setActiveChat({ id: data.room.id, consultationId, userId });
    }
  }

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl" style={{ background: 'var(--surface-2)' }} />)}
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Expert Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Questions matched to your expertise — {expert?.domain?.name}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">No targeted questions yet</p>
          <p className="text-sm mt-1">You'll be notified when questions match your domain</p>
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

  return (
    <div className="card transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#c2714f,#d4a853)' }}>
          #{rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{consultation.title}</h3>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{consultation.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Match score</div>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{(similarityScore * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {consultation.domain && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                {consultation.domain.icon} {consultation.domain.name}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(212,168,83,0.1)', color: '#9a7a2e' }}>{consultation.difficulty}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>by Anonymous</span>
          </div>

          {mySubmission && (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-4 text-sm"
              style={{ background: 'var(--surface-2)' }}>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>My submission:</span>
              <span className="text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>{mySubmission.status}</span>
              {mySubmission.aiScore != null && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI: {mySubmission.aiScore}</span>}
              {mySubmission.examScore != null && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Exam: {mySubmission.examScore}</span>}
              {mySubmission.finalScore != null && <span className="text-xs font-bold" style={{ color: '#34d399' }}>Final: {mySubmission.finalScore}</span>}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            {accepted === null ? (
              <>
                <button onClick={() => onAccept(true)} disabled={processing}
                  className="px-4 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                  style={{ background: '#22c55e' }}>
                  ✓ Accept
                </button>
                <button onClick={() => onAccept(false)} disabled={processing}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-60">
                  Decline
                </button>
              </>
            ) : accepted ? (
              <span className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>✓ Accepted</span>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Declined</span>
            )}

            {canSubmitAnswer && (
              <button onClick={onSubmitAnswer} className="btn-primary ms-auto px-4 py-2 text-sm flex items-center gap-2">
                ✍️ Submit Answer
              </button>
            )}
            {canTakeExam && (
              <button onClick={onTakeExam}
                className="ms-auto px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                style={{ background: '#f59e0b' }}>
                🧪 Take Exam
              </button>
            )}
            {hasChatAccess && (
              <button onClick={onOpenChat} className="btn-primary ms-auto px-4 py-2 text-sm flex items-center gap-2">
                💬 Open Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
