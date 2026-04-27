'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import ChatInterface from './ChatInterface';

interface Notification {
  id: string; type: string; title: string; body: string;
  isRead: boolean; consultationId: string | null; createdAt: string;
}

interface ChatRoom {
  id: string; consultationId: string; isActive: boolean; unlockedAt: string;
  consultation: { title: string };
  messages: Array<{ content: string; createdAt: string; senderName: string }>;
}

const TYPE_ICON: Record<string, string> = {
  targeted: '🎯', exam_unlocked: '📝', chat_unlocked: '💬',
  answer_evaluated: '⭐', competition_won: '🏆',
};

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

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton" />)}
    </div>
  );

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div className="p-8 space-y-6">
      {activeChat && <ChatInterface roomId={activeChat} onClose={() => { setActiveChat(null); load(); }} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: 'var(--accent)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Active chat rooms */}
      {rooms.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            💬 Active Chats
            <span className="w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {rooms.length}
            </span>
          </h2>
          <div className="space-y-2">
            {rooms.map(room => (
              <div key={room.id}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onClick={() => setActiveChat(room.id)}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {room.consultation.title}
                  </div>
                  {room.messages[0] && (
                    <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {room.messages[0].senderName}: {room.messages[0].content}
                    </div>
                  )}
                </div>
                <span className="text-xs px-3 py-1.5 rounded-xl font-medium ms-3 flex-shrink-0 transition-all"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>
                  Open →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications list */}
      {notifs.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">🔔</div>
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll be notified when experts respond</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className="card flex items-start gap-4 transition-all"
              style={!n.isRead ? {
                border: '1px solid rgba(99,102,241,0.25)',
                background: 'rgba(99,102,241,0.04)',
              } : {}}>
              <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: 'var(--accent)' }} />
                  )}
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.body}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
