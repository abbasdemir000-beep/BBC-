'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';

interface Submission {
  id: string;
  expertId: string;
  status: string;
  aiScore: number | null;
  examScore: number | null;
  finalScore: number | null;
  expert: { name: string; domain?: { name: string; icon: string } };
}

interface ChatRoom {
  id: string;
  expertId: string;
  isActive: boolean;
}

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  createdAt: string;
  domain?: { name: string; icon: string; color: string };
  submissions: Submission[];
  chatRooms: ChatRoom[];
  _count: { submissions: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  analyzing: 'bg-blue-100 text-blue-700',
  routing: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  examining: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function MyQuestions() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/consultations/mine');
    if (res.ok) setConsultations((await res.json()).consultations ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!user) return (
    <div className="p-8">
      <div className="card text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-medium">Sign in to see your questions</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {activeChat && <ChatInterface roomId={activeChat} onClose={() => { setActiveChat(null); load(); }} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Questions</h1>
        <p className="text-slate-500 text-sm mt-1">{consultations.length} question{consultations.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {consultations.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ consultation: c, onOpenChat }: {
  consultation: Consultation;
  onOpenChat: (roomId: string) => void;
}) {
  return (
    <div className="card border border-slate-100 hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900">{c.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {c.domain && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                {c.domain.icon} {c.domain.name}
              </span>
            )}
            <span className="text-xs text-slate-400">{c.difficulty}</span>
            <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-slate-700">{c._count.submissions}</div>
          <div className="text-xs text-slate-400">answers</div>
        </div>
      </div>

      {/* Submissions */}
      {c.submissions.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expert Answers</div>
          {c.submissions.map(sub => {
            const chatRoom = c.chatRooms.find(r => r.expertId === sub.expertId && r.isActive);
            return (
              <div key={sub.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {sub.expert.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{sub.expert.name}</div>
                  {sub.expert.domain && (
                    <div className="text-xs text-slate-500">{sub.expert.domain.icon} {sub.expert.domain.name}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  {sub.aiScore != null && (
                    <span className="text-slate-500">AI: <strong>{sub.aiScore}</strong></span>
                  )}
                  {sub.examScore != null && (
                    <span className="text-slate-500">Exam: <strong>{sub.examScore}</strong></span>
                  )}
                  {sub.finalScore != null && (
                    <span className="text-green-700 font-bold">⭐ {sub.finalScore}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-lg ${STATUS_COLORS[sub.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {sub.status}
                  </span>
                </div>
                {chatRoom && (
                  <button
                    onClick={() => onOpenChat(chatRoom.id)}
                    className="ms-2 px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition-all flex-shrink-0"
                  >
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
