'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  consultationId: string | null;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  consultationId: string;
  isActive: boolean;
  unlockedAt: string;
  consultation: { title: string };
  messages: Array<{ content: string; createdAt: string; senderName: string }>;
}

export default function NotificationsPanel() {
  const { refresh } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [nRes, rRes] = await Promise.all([
      fetch('/api/notifications'),
      fetch('/api/chat/rooms'),
    ]);
    if (nRes.ok) setNotifs((await nRes.json()).notifications ?? []);
    if (rRes.ok) setRooms((await rRes.json()).rooms ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markAllRead() {
    const unread = notifs.filter(n => !n.isRead).map(n => n.id);
    if (!unread.length) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread }),
    });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    refresh();
  }

  const TYPE_ICON: Record<string, string> = {
    targeted: '🎯',
    exam_unlocked: '📝',
    chat_unlocked: '💬',
    answer_evaluated: '⭐',
    competition_won: '🏆',
  };

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {activeChat && <ChatInterface roomId={activeChat} onClose={() => { setActiveChat(null); load(); }} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{notifs.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifs.some(n => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium px-4 py-2 rounded-xl hover:bg-brand-50 transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Chat Rooms */}
      {rooms.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">💬 Active Chats</h2>
          <div className="space-y-3">
            {rooms.map(room => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => setActiveChat(room.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{room.consultation.title}</div>
                  {room.messages[0] && (
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {room.messages[0].senderName}: {room.messages[0].content}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ms-3">
                  <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl font-medium group-hover:bg-brand-100 transition-all">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications list */}
      {notifs.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🔔</div>
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`card flex items-start gap-4 transition-all ${!n.isRead ? 'border border-brand-200 bg-brand-50/30' : 'border border-transparent'}`}
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{n.body}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
