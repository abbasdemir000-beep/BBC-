'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

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
  { title: 'Grow your business with AI', body: 'Join 50,000+ companies using our platform to automate knowledge workflows.', cta: 'Learn More', icon: '🚀' },
  { title: 'Expert Network — Now Open', body: 'Connect with verified professionals in 20+ domains. Get answers fast.', cta: 'Explore', icon: '🧠' },
  { title: 'KnowledgeMarket Pro', body: 'Unlimited questions, priority routing, and advanced analytics for teams.', cta: 'Try Free', icon: '⭐' },
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

  useEffect(() => { apiPromise.then(data => { setApiData(data); setApiDone(true); }); }, [apiPromise]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const nextStep = [...PIPELINE_STEPS].reverse().findIndex(s => s.delay <= next);
        const resolvedStep = nextStep >= 0 ? PIPELINE_STEPS.length - 1 - nextStep : -1;
        if (resolvedStep >= 0) setCurrentStep(resolvedStep);
        return next;
      });
      setTimeLeft(prev => { if (prev <= 1) { setCanSkip(true); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleSkip() {
    if (apiDone && apiData) onDone(apiData); else onSkip();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,26,26,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg mx-4 space-y-4">
        {/* Ad card */}
        <div className="p-10 text-center"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
          <div className="text-5xl mb-4">{ad.icon}</div>
          <h2 className="text-2xl font-bold italic serif mb-3">{ad.title}</h2>
          <p className="text-sm mb-6 font-sans" style={{ opacity: 0.7 }}>{ad.body}</p>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] font-sans" style={{ opacity: 0.4 }}>Sponsored</span>
            <button className="btn-editorial-outline !border-current" style={{ color: 'var(--bg)', borderColor: 'rgba(249,247,242,0.4)', padding: '8px 20px' }}>
              {ad.cta} →
            </button>
          </div>
        </div>

        {/* Pipeline */}
        <div className="p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-4 font-sans" style={{ opacity: 0.4 }}>
            Processing your inquiry
          </div>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className={`flex items-center gap-3 transition-all duration-500 ${i <= currentStep ? 'opacity-100' : 'opacity-25'}`}>
                <span className="text-base w-5 text-center">{i < currentStep ? '✅' : i === currentStep ? step.icon : '○'}</span>
                <span className="text-sm font-sans" style={{ color: i === currentStep ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: i === currentStep ? 700 : 400 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          {canSkip ? (
            <button onClick={handleSkip} className="btn-editorial-outline" style={{ padding: '8px 24px' }}>
              {apiDone ? 'View Results →' : 'Skip →'}
            </button>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-widest font-sans" style={{ color: 'rgba(249,247,242,0.5)' }}>
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

    promise.catch(err => { setError(err instanceof Error ? err.message : 'Something went wrong'); setStep('input'); });
    setApiPromise(promise);
    setStep('ad');
  }

  const urgencyOpts = [
    { key: 'low',      label: t('ask_low')      },
    { key: 'normal',   label: t('ask_normal')   },
    { key: 'high',     label: t('ask_high')     },
    { key: 'critical', label: t('ask_critical') },
  ];

  if (step === 'ad' && apiPromise) return (
    <AdOverlay apiPromise={apiPromise}
      onDone={data => { setAnalysis(data); setStep('result'); }}
      onSkip={() => { apiPromise.then(data => { setAnalysis(data); setStep('result'); }).catch(() => setStep('input')); }} />
  );

  if (step === 'result' && analysis) return (
    <AnalysisResult analysis={analysis} consultationId={consultationId}
      onReset={() => { setStep('input'); setTitle(''); setDescription(''); setAnalysis(null); }} />
  );

  return (
    <div className="space-y-12" dir={dir}>
      <div className="flex justify-between items-baseline flex-wrap mb-10 gap-3">
        <div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight serif">
            Submit a<br /><span className="italic">Knowledge Inquiry</span>
          </h1>
          <p className="tag-editorial mt-3">{t('ask_subtitle')}</p>
        </div>
      </div>

      <div className="editorial-card p-10 md:p-12 relative max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block font-sans" style={{ opacity: 0.4 }}>
              {t('ask_label_title')}
            </label>
            <input
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '14px 16px', fontSize: 14, outline: 'none', width: '100%', fontFamily: 'Inter' }}
              placeholder={t('ask_placeholder_t')}
              value={title} onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={200}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block font-sans" style={{ opacity: 0.4 }}>
              {t('ask_label_desc')}
            </label>
            <textarea
              className="serif"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '14px 16px', fontSize: 17, lineHeight: 1.6, outline: 'none', width: '100%', minHeight: 160, resize: 'none', fontStyle: 'italic', fontFamily: 'Playfair Display, Georgia, serif' }}
              placeholder="Describe your technical challenge, research problem, or innovation need..."
              value={description} onChange={e => setDescription(e.target.value)} required minLength={5}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <div className="text-end text-[10px] mt-1 font-sans" style={{ opacity: 0.35 }}>{description.length} chars</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest font-sans" style={{ opacity: 0.4 }}>
                {t('ask_urgency')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {urgencyOpts.map(u => (
                  <button key={u.key} type="button" onClick={() => setUrgency(u.key)}
                    style={{
                      padding: '10px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontFamily: 'Inter',
                      border: urgency === u.key ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                      background: urgency === u.key ? 'var(--text-primary)' : 'transparent',
                      color: urgency === u.key ? 'var(--bg)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ border: '1px solid rgba(168,50,48,0.3)', background: 'rgba(168,50,48,0.06)', padding: '12px 16px', fontSize: 13, color: '#a83230', fontFamily: 'Inter' }}>
              {error}
            </div>
          )}

          <div className="flex items-end justify-between gap-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-[10px] uppercase tracking-widest font-bold font-sans" style={{ opacity: 0.35 }}>
              Bounty (optional)
            </div>
            <button type="submit" className="btn-editorial" style={{ minWidth: 180 }}>{t('ask_submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalysisResult({ analysis, consultationId, onReset }: { analysis: Analysis; consultationId: string; onReset: () => void }) {
  const { t, dir } = useLang();
  const a = analysis.analysis;
  const flags = JSON.parse(a.safetyFlags || '[]') as string[];

  const resultItems = [
    { label: t('result_domain'),     value: a.detectedDomain },
    { label: t('result_subdomain'),  value: a.detectedSubDomain },
    { label: t('result_topic'),      value: a.detectedTopic },
    { label: t('result_qtype'),      value: a.questionType?.replace('_', ' ') },
    { label: t('result_difficulty'), value: a.difficulty },
    { label: t('result_confidence'), value: `${Math.round(a.confidence * 100)}%` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-3xl" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light serif italic">{t('ask_done_title')}</h1>
        <button onClick={onReset} className="btn-editorial-outline" style={{ padding: '8px 20px' }}>{t('ask_another')}</button>
      </div>

      {!a.isSafe && (
        <div style={{ border: '1px solid rgba(168,50,48,0.3)', background: 'rgba(168,50,48,0.06)', padding: '16px 20px' }}>
          <div className="font-bold mb-1 font-sans text-sm" style={{ color: '#a83230' }}>{t('safety_warning')}</div>
          <p className="text-sm font-sans" style={{ color: '#a83230', opacity: 0.8 }}>{flags.join(', ')}</p>
        </div>
      )}

      <div className="editorial-card p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {resultItems.map(item => (
            <div key={item.label} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1 font-sans" style={{ opacity: 0.4 }}>{item.label}</div>
              <div className="text-sm font-bold capitalize font-sans" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-2 font-sans" style={{ color: 'var(--accent)' }}>
            {t('result_reasoning')}
          </div>
          <p className="text-sm leading-relaxed italic serif" style={{ color: 'var(--text-secondary)' }}>{a.reasoning}</p>
        </div>
        <div className="text-[10px] font-sans" style={{ opacity: 0.3 }}>{analysis.processingTimeMs}ms · ID: {consultationId}</div>
      </div>

      {analysis.routings.length > 0 && (
        <div className="editorial-card p-8 space-y-4">
          <h2 className="font-bold text-lg serif italic">{t('result_matched')}</h2>
          {analysis.routings.map((r, i) => (
            <div key={i} className="flex items-center gap-6 py-4"
              style={{ borderBottom: i < analysis.routings.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-8 h-8 flex items-center justify-center font-black text-sm serif"
                style={{ border: '1px solid var(--border)' }}>{r.rank}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{r.expertName}</div>
                <div className="text-[10px] uppercase tracking-widest font-sans mt-0.5" style={{ opacity: 0.4 }}>
                  {t('result_similarity')}: {(r.similarityScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="w-28 h-px relative" style={{ background: 'var(--border)' }}>
                <div className="absolute inset-y-0 left-0 h-px"
                  style={{ width: `${r.similarityScore * 100}%`, background: 'var(--text-primary)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="editorial-card p-10 text-center space-y-4">
        <p className="text-2xl font-light italic serif">{t('ask_comp_started')}</p>
        <p className="text-sm font-sans" style={{ opacity: 0.5 }}>
          Experts are being notified. You'll receive a chat invitation when an expert passes examination.
        </p>
      </div>
    </motion.div>
  );
}
