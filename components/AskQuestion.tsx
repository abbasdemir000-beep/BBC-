'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

type Step = 'input' | 'ad' | 'result';

interface Analysis {
  analysis: {
    detectedDomain: string; detectedSubDomain: string; detectedTopic: string;
    questionType: string; difficulty: string; confidence: number;
    reasoning: string; isSafe: boolean; safetyFlags: string;
  };
  routings: Array<{ expertName: string; similarityScore: number; rank: number }>;
  processingTimeMs: number;
}

const ADS = [
  { title: 'Grow your business with AI', body: 'Join 50,000+ companies using our platform to automate knowledge workflows.', cta: 'Learn More', color: 'from-blue-600 to-indigo-700', icon: '🚀' },
  { title: 'Expert Network — Now Open', body: 'Connect with verified professionals in 20+ domains. Get answers fast.', cta: 'Explore', color: 'from-purple-600 to-pink-600', icon: '🧠' },
  { title: 'KnowledgeMarket Pro', body: 'Unlimited questions, priority routing, and advanced analytics for teams.', cta: 'Try Free', color: 'from-green-600 to-teal-600', icon: '⭐' },
];

const PIPELINE_STEPS = [
  { label: 'Analyzing your question…', icon: '🤖', delay: 0 },
  { label: 'Classifying domain & topic…', icon: '📚', delay: 4 },
  { label: 'Routing to top experts…', icon: '🎯', delay: 9 },
  { label: 'Examining expert candidates…', icon: '🧪', delay: 16 },
  { label: 'Selecting best matches…', icon: '✅', delay: 22 },
];

function AdOverlay({ onSkip, onDone, apiPromise }: {
  onSkip: () => void;
  onDone: (data: Analysis) => void;
  apiPromise: Promise<Analysis>;
}) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [apiData, setApiData] = useState<Analysis | null>(null);
  const adRef = useRef(ADS[Math.floor(Math.random() * ADS.length)]);
  const ad = adRef.current;

  useEffect(() => {
    apiPromise.then(data => { setApiData(data); setApiDone(true); });
  }, [apiPromise]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const nextStep = [...PIPELINE_STEPS].reverse().findIndex(s => s.delay <= next);
        const resolvedStep = nextStep >= 0 ? PIPELINE_STEPS.length - 1 - nextStep : -1;
        if (resolvedStep >= 0) setCurrentStep(resolvedStep);
        return next;
      });
      setTimeLeft(prev => {
        if (prev <= 1) { setCanSkip(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleSkip() {
    if (apiDone && apiData) onDone(apiData);
    else onSkip();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 space-y-4">
        {/* Ad card */}
        <div className={`rounded-3xl bg-gradient-to-br ${ad.color} p-8 text-white shadow-2xl`}>
          <div className="text-5xl mb-4">{ad.icon}</div>
          <h2 className="text-2xl font-black mb-2">{ad.title}</h2>
          <p className="text-white/80 text-sm mb-6">{ad.body}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60 uppercase tracking-widest font-medium">Sponsored</span>
            <button className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all border border-white/30">
              {ad.cta} →
            </button>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-xl">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Processing your question</div>
          <div className="space-y-2">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className={`flex items-center gap-3 transition-all duration-500 ${i <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-base w-6 text-center">{i < currentStep ? '✅' : i === currentStep ? step.icon : '○'}</span>
                <span className={`text-sm ${i === currentStep ? 'text-brand-700 font-semibold' : 'text-[var(--text-secondary)]'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skip button */}
        <div className="flex justify-end">
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="px-6 py-2.5 bg-[var(--surface)] text-[var(--text-primary)] rounded-xl font-semibold text-sm shadow-lg hover:bg-[var(--surface-2)] transition-all flex items-center gap-2"
            >
              {apiDone ? 'View Results →' : 'Skip Ad →'}
            </button>
          ) : (
            <div className="px-6 py-2.5 bg-white/20 text-white rounded-xl text-sm font-medium backdrop-blur-sm">
              Skip in {timeLeft}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AskQuestion() {
  const [step, setStep] = useState<Step>('input');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [consultationId, setConsultationId] = useState('');
  const [apiPromise, setApiPromise] = useState<Promise<Analysis> | null>(null);
  const { t, dir, lang } = useLang();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const promise = (async (): Promise<Analysis> => {
      const res = await fetch('/api/consultations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, urgency, language: lang }),
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
      return aData;
    })();

    promise.catch(err => {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('input');
    });

    setApiPromise(promise);
    setStep('ad');
  }

  const urgencyOpts = [
    { key: 'low',      label: t('ask_low'),      icon: '🔵' },
    { key: 'normal',   label: t('ask_normal'),    icon: '⚪' },
    { key: 'high',     label: t('ask_high'),      icon: '🟡' },
    { key: 'critical', label: t('ask_critical'),  icon: '🔴' },
  ];

  if (step === 'ad' && apiPromise) return (
    <AdOverlay
      apiPromise={apiPromise}
      onDone={data => { setAnalysis(data); setStep('result'); }}
      onSkip={() => {
        apiPromise.then(data => { setAnalysis(data); setStep('result'); }).catch(() => setStep('input'));
      }}
    />
  );

  if (step === 'result' && analysis) return (
    <AnalysisResult
      analysis={analysis}
      consultationId={consultationId}
      onReset={() => { setStep('input'); setTitle(''); setDescription(''); setAnalysis(null); }}
    />
  );

  return (
    <div className="p-8 max-w-2xl mx-auto" dir={dir}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('ask_title')}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t('ask_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('ask_label_title')}</label>
          <input className="input" placeholder={t('ask_placeholder_t')} value={title}
            onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={200} />
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('ask_label_desc')}</label>
          <textarea className="input resize-none" rows={6} placeholder={t('ask_placeholder_d')}
            value={description} onChange={e => setDescription(e.target.value)} required minLength={5} />
          <div className="text-xs text-[var(--text-muted)] mt-1 text-end">{description.length} chars</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">{t('ask_urgency')}</label>
          <div className="grid grid-cols-4 gap-2">
            {urgencyOpts.map(u => (
              <button key={u.key} type="button" onClick={() => setUrgency(u.key)}
                className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                  urgency === u.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-2)]'
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('ask_done_title')}</h1>
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
            <div key={item.label} className="bg-[var(--bg)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-muted)] mb-0.5">{item.icon} {item.label}</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] capitalize">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-brand-50 rounded-xl p-3">
          <div className="text-xs text-brand-600 font-semibold mb-1">{t('result_reasoning')}</div>
          <p className="text-sm text-[var(--text-secondary)]">{a.reasoning}</p>
        </div>
        <div className="text-xs text-[var(--text-muted)]">{analysis.processingTimeMs}ms</div>
      </div>

      {analysis.routings.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-[var(--text-secondary)]">{t('result_matched')}</h2>
          {analysis.routings.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{r.rank}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--text-secondary)]">{r.expertName}</div>
                <div className="text-xs text-[var(--text-muted)]">{t('result_similarity')}: {(r.similarityScore * 100).toFixed(1)}%</div>
              </div>
              <div className="w-24 bg-[var(--surface-2)] rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${r.similarityScore * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card text-center space-y-3">
        <div className="text-3xl">⚡</div>
        <h3 className="font-bold text-[var(--text-primary)]">{t('ask_comp_started')}</h3>
        <p className="text-sm text-[var(--text-muted)]">Experts are being notified and examined. You'll receive a chat invitation when an expert passes.</p>
        <div className="text-xs text-[var(--text-muted)]">ID: {consultationId}</div>
      </div>
    </div>
  );
}
