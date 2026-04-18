'use client';
import { useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

type Step = 'input' | 'analyzing' | 'result';

interface Analysis {
  analysis: {
    detectedDomain: string; detectedSubDomain: string; detectedTopic: string;
    questionType: string; difficulty: string; confidence: number;
    reasoning: string; isSafe: boolean; safetyFlags: string;
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
  const { t, dir } = useLang();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('analyzing');

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, urgency }),
      });
      const resData = await res.json() as { id?: string; error?: string };
      if (!res.ok) throw new Error(resData.error || 'Failed to create consultation');
      const id = resData.id!;
      setConsultationId(id);

      const aRes = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: id, text: `${title}\n\n${description}` }),
      });
      const aData = await aRes.json() as Analysis & { error?: string };
      if (!aRes.ok) throw new Error(aData.error || 'Analysis failed');
      setAnalysis(aData);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('input');
    }
  }

  if (step === 'analyzing') return <AnalyzingScreen />;
  if (step === 'result' && analysis) return (
    <AnalysisResult analysis={analysis} consultationId={consultationId}
      onReset={() => { setStep('input'); setTitle(''); setDescription(''); setAnalysis(null); }} />
  );

  const urgencyOpts = [
    { key: 'low',      label: t('ask_low'),      icon: '🔵' },
    { key: 'normal',   label: t('ask_normal'),    icon: '⚪' },
    { key: 'high',     label: t('ask_high'),      icon: '🟡' },
    { key: 'critical', label: t('ask_critical'),  icon: '🔴' },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto" dir={dir}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('ask_title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('ask_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('ask_label_title')}</label>
          <input className="input" placeholder={t('ask_placeholder_t')} value={title}
            onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={200} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('ask_label_desc')}</label>
          <textarea className="input resize-none" rows={6} placeholder={t('ask_placeholder_d')}
            value={description} onChange={e => setDescription(e.target.value)} required minLength={5} />
          <div className="text-xs text-slate-400 mt-1 text-end">{description.length} chars</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('ask_urgency')}</label>
          <div className="grid grid-cols-4 gap-2">
            {urgencyOpts.map(u => (
              <button key={u.key} type="button" onClick={() => setUrgency(u.key)}
                className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                  urgency === u.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>
                {u.icon} {u.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

        <button type="submit" className="btn-primary w-full py-3 text-base font-semibold">{t('ask_submit')}</button>
      </form>
    </div>
  );
}

function AnalyzingScreen() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <div className="relative w-24 h-24">
        <div className="w-24 h-24 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-900">{t('ask_analyzing')}</h2>
        <p className="text-slate-500 text-sm">{t('ask_analyzing_sub')}</p>
      </div>
    </div>
  );
}

function AnalysisResult({ analysis, consultationId, onReset }: { analysis: Analysis; consultationId: string; onReset: () => void }) {
  const { t, dir } = useLang();
  const a = analysis.analysis;
  const flags = JSON.parse(a.safetyFlags || '[]') as string[];

  const resultItems = [
    { label: t('result_domain'),     value: a.detectedDomain,      icon: '📚' },
    { label: t('result_subdomain'),  value: a.detectedSubDomain,   icon: '🗂️' },
    { label: t('result_topic'),      value: a.detectedTopic,       icon: '🏷️' },
    { label: t('result_qtype'),      value: a.questionType?.replace('_', ' '), icon: '❓' },
    { label: t('result_difficulty'), value: a.difficulty,          icon: '📊' },
    { label: t('result_confidence'), value: `${Math.round(a.confidence * 100)}%`, icon: '🎯' },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-slide-in" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('ask_done_title')}</h1>
        <button onClick={onReset} className="btn-secondary text-sm">{t('ask_another')}</button>
      </div>

      {!a.isSafe && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="font-semibold text-red-700 mb-1">{t('safety_warning')}</div>
          <p className="text-sm text-red-600">{flags.join(', ')}</p>
        </div>
      )}

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {resultItems.map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-0.5">{item.icon} {item.label}</div>
              <div className="text-sm font-semibold text-slate-800 capitalize">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-brand-50 rounded-xl p-3">
          <div className="text-xs text-brand-600 font-semibold mb-1">{t('result_reasoning')}</div>
          <p className="text-sm text-slate-700">{a.reasoning}</p>
        </div>
        <div className="text-xs text-slate-400">{analysis.processingTimeMs}ms</div>
      </div>

      {analysis.routings.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800">{t('result_matched')}</h2>
          {analysis.routings.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{r.rank}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{r.expertName}</div>
                <div className="text-xs text-slate-500">{t('result_similarity')}: {(r.similarityScore * 100).toFixed(1)}%</div>
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
        <h3 className="font-bold text-slate-900">{t('ask_comp_started')}</h3>
        <div className="text-xs text-slate-400">ID: {consultationId}</div>
      </div>
    </div>
  );
}
