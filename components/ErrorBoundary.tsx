'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center rounded-2xl m-4"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-xs px-4 py-2 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
