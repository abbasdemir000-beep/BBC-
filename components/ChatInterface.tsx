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
      <div className="w-96 h-[560px] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="modal-header px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              💬
            </div>
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
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <div className="text-3xl mb-2">👋</div>
              <p>Start the conversation!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%] group">
                  {!isMine && (
                    <div className="text-xs mb-1 px-1" style={{ color: 'var(--text-muted)' }}>
                      {msg.senderName} · {msg.senderRole}
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine ? 'rounded-br-md' : 'rounded-bl-md'
                  }`} style={isMine
                    ? { background: '#c2714f', color: '#fff' }
                    : { background: 'var(--surface-2)', color: 'var(--text-primary)' }
                  }>
                    {msg.content}
                  </div>
                  <div className={`text-xs mt-0.5 px-1 ${isMine ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-3 flex gap-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message…"
            className="input flex-1 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-10 h-10 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0"
            style={{ background: '#c2714f' }}
          >
            {sending ? '…' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
}
