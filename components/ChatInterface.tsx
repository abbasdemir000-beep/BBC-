'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface Props {
  roomId: string;
  onClose: () => void;
}

export default function ChatInterface({ roomId, onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/chat/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/chat/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      setInput('');
      await fetchMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div className="w-96 h-[560px] bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">💬</div>
            <div>
              <div className="text-white text-sm font-semibold">Live Chat</div>
              <div className="text-white/70 text-xs">Expert consultation</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-[var(--text-muted)] text-sm py-8">
              <div className="text-3xl mb-2">👋</div>
              <p>Start the conversation!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] group`}>
                  {!isMine && (
                    <div className="text-xs text-[var(--text-muted)] mb-1 px-1">
                      {msg.senderName} · {msg.senderRole}
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine
                      ? 'bg-brand-500 text-white rounded-br-md'
                      : 'bg-[var(--bg)] text-[var(--text-secondary)] rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`text-xs text-[var(--text-muted)] mt-0.5 px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-3 border-t border-[var(--border)] flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 disabled:opacity-50 transition-all flex-shrink-0"
          >
            {sending ? '…' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
}
