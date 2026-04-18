'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';

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

export default function ExpertDashboard() {
  const { expert } = useAuth();
  const [items, setItems] = useState<Targeted[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<ChatRoomInfo | null>(null);
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
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {activeChat && (
        <ChatInterface
          roomId={activeChat.id}
          onClose={() => setActiveChat(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expert Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Questions matched to your expertise — {expert?.domain?.name}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TargetedCard({ item, processing, onAccept, onOpenChat }: {
  item: Targeted;
  processing: boolean;
  onAccept: (accepted: boolean) => void;
  onOpenChat: () => void;
}) {
  const { consultation, mySubmission, similarityScore, rank, accepted } = item;
  const hasChatAccess = mySubmission && (mySubmission.examScore ?? 0) >= 60;

  return (
    <div className="card border border-slate-100 hover:border-brand-200 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          #{rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 leading-snug">{consultation.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{consultation.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-slate-500">Match score</div>
              <div className="text-lg font-bold text-brand-600">{(similarityScore * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {consultation.domain && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                {consultation.domain.icon} {consultation.domain.name}
              </span>
            )}
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">{consultation.difficulty}</span>
            <span className="text-xs text-slate-400">by {consultation.user.name}</span>
          </div>

          {mySubmission && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center gap-4 text-sm">
              <span className="text-slate-600 font-medium">My submission:</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{mySubmission.status}</span>
              {mySubmission.aiScore != null && <span className="text-xs text-slate-500">AI: {mySubmission.aiScore}</span>}
              {mySubmission.examScore != null && <span className="text-xs text-slate-500">Exam: {mySubmission.examScore}</span>}
              {mySubmission.finalScore != null && <span className="text-xs font-bold text-green-700">Final: {mySubmission.finalScore}</span>}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            {accepted === null ? (
              <>
                <button
                  onClick={() => onAccept(true)}
                  disabled={processing}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition-all"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => onAccept(false)}
                  disabled={processing}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-300 disabled:opacity-60 transition-all"
                >
                  Decline
                </button>
              </>
            ) : accepted ? (
              <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-medium">✓ Accepted</span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl font-medium">Declined</span>
            )}

            {hasChatAccess && (
              <button
                onClick={onOpenChat}
                className="ms-auto px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all flex items-center gap-2"
              >
                💬 Open Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
