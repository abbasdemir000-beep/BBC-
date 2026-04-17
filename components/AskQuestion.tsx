'use client';
import { useState } from 'react';

type Step = 'input' | 'analyzing' | 'result';

interface Analysis {
  analysis: {
    detectedDomain: string;
    detectedSubDomain: string;
    detectedTopic: string;
    questionType: string;
    difficulty: string;
    confidence: number;
    reasoning: string;
    isSafe: boolean;
    safetyFlags: string;
  };
  routings: Array<{ expertName: string; similarityScore: number; rank: number }>;
  processingTimeMs: number;
}

export default function AskQuestion() {
  const [step, setStep] = useState<Step>('input');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [consultationId, setConsultationId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('analyzing');

    try {
      // 1. Create consultation
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, urgency }),
      });
      if (!res.ok) throw new Error('Failed to create consultation');
      const { id } = await res.json() as { id: string };
      setConsultationId(id);

      // 2. AI analysis + routing
      const aRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: id, text: `${title}\n\n${description}` }),
      });
      if (!aRes.ok) throw new Error('Analysis failed');
      const aData = await aRes.json() as Analysis;
      setAnalysis(aData);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('input');
    }
  }

  if (step === 'analyzing') return <AnalyzingScreen />;
  if (step === 'result' && analysis) return <AnalysisResult analysis={analysis} consultationId={consultationId} onReset={() => { setStep('input'); setTitle(''); setDescription(''); setAnalysis(null); }} />;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Ask a Question</h1>
        <p className="text-slate-500 text-sm mt-1">AI will classify your question and route it to the best matching experts</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Question Title *</label>
          <input
            className="input"
            placeholder="e.g. How does quantum entanglement work in computing?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            minLength={10}
            maxLength={200}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Detailed Description *</label>
          <textarea
            className="input resize-none"
            rows={6}
            placeholder="Provide as much context as possible. Include what you've already tried, specific constraints, and what kind of answer you're looking for..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={20}
          />
          <div className="text-xs text-slate-400 mt-1 text-right">{description.length} chars</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Urgency</label>
          <div className="grid grid-cols-4 gap-2">
            {['low', 'normal', 'high', 'critical'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                className={`py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                  urgency === u ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {u === 'low' ? '🔵' : u === 'normal' ? '⚪' : u === 'high' ? '🟡' : '🔴'} {u}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

        <button type="submit" className="btn-primary w-full py-3 text-base font-semibold">
          🚀 Submit & Start Competition
        </button>

        <p className="text-xs text-slate-400 text-center">
          AI will automatically detect the domain, route to experts, and start a knowledge competition
        </p>
      </form>
    </div>
  );
}

function AnalyzingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <div className="relative w-24 h-24">
        <div className="w-24 h-24 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-900">AI Analyzing Your Question</h2>
        <p className="text-slate-500 text-sm">Detecting domain, routing to experts, generating competition...</p>
      </div>
      <div className="flex gap-3 text-sm text-slate-400">
        {['Classifying domain', 'Generating embeddings', 'Matching experts'].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisResult({ analysis, consultationId, onReset }: { analysis: Analysis; consultationId: string; onReset: () => void }) {
  const a = analysis.analysis;
  const flags = JSON.parse(a.safetyFlags || '[]') as string[];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">AI Analysis Complete</h1>
        <button onClick={onReset} className="btn-secondary text-sm">Ask Another</button>
      </div>

      {!a.isSafe && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="font-semibold text-red-700 mb-1">⚠️ Safety Warning</div>
          <p className="text-sm text-red-600">This question was flagged for safety review: {flags.join(', ')}</p>
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Classification Results</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Domain', value: a.detectedDomain, icon: '📚' },
            { label: 'Sub-Domain', value: a.detectedSubDomain, icon: '🗂️' },
            { label: 'Topic', value: a.detectedTopic, icon: '🏷️' },
            { label: 'Question Type', value: a.questionType?.replace('_', ' '), icon: '❓' },
            { label: 'Difficulty', value: a.difficulty, icon: '📊' },
            { label: 'Confidence', value: `${Math.round(a.confidence * 100)}%`, icon: '🎯' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-0.5">{item.icon} {item.label}</div>
              <div className="text-sm font-semibold text-slate-800 capitalize">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-brand-50 rounded-xl p-3">
          <div className="text-xs text-brand-600 font-semibold mb-1">AI Reasoning</div>
          <p className="text-sm text-slate-700">{a.reasoning}</p>
        </div>
        <div className="text-xs text-slate-400">Processed in {analysis.processingTimeMs}ms</div>
      </div>

      {analysis.routings.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800">Matched Experts</h2>
          <p className="text-xs text-slate-500">The following experts were routed this question based on knowledge similarity</p>
          {analysis.routings.map(r => (
            <div key={r.expertId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {r.rank}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{r.expertName}</div>
                <div className="text-xs text-slate-500">Similarity: {(r.similarityScore * 100).toFixed(1)}%</div>
              </div>
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${r.similarityScore * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card text-center space-y-3">
        <div className="text-3xl">⚡</div>
        <h3 className="font-bold text-slate-900">Competition Started!</h3>
        <p className="text-sm text-slate-500">Experts are now notified and competing to provide the best answer. You will be notified when results are ready.</p>
        <div className="text-xs text-slate-400">Consultation ID: {consultationId}</div>
      </div>
    </div>
  );
}
