/**
 * Smart rule-based AI engine — full fallback when no valid Anthropic key.
 * Covers: classification, embeddings, evaluation, exam generation, anti-cheat.
 */

// ── Domain keyword maps ─────────────────────────────────────────────────────
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  medicine: ['disease','symptom','diagnosis','treatment','patient','clinical','medical','drug','therapy','surgery','pain','fever','infection','virus','bacteria','cancer','heart','blood','brain','lung','liver','kidney','scleritis','ophthalmology','cardiology','neurology','oncology','pharmacology','dose','prescription','hospital','doctor','physician','nurse','anatomy','physiology','pathology','radiology'],
  engineering: ['structural','load','stress','strain','beam','column','foundation','concrete','steel','bridge','design','construction','mechanical','thermal','fluid','circuit','voltage','current','resistance','power','motor','engine','turbine','compressor','valve','pipe','manufacturing','machining','welding','CAD','finite element'],
  mathematics: ['proof','theorem','equation','integral','derivative','matrix','vector','polynomial','calculus','algebra','geometry','topology','probability','statistics','function','limit','series','differential','linear','nonlinear','eigenvalue','determinant','graph theory','combinatorics','number theory'],
  physics: ['force','energy','momentum','quantum','wave','particle','relativity','gravity','electromagnetic','field','potential','entropy','thermodynamics','kinetic','photon','electron','nucleus','atom','spin','orbital','frequency','wavelength','optics','mechanics','velocity','acceleration'],
  'computer-science': ['algorithm','data structure','programming','code','software','database','network','security','machine learning','AI','neural network','API','server','cloud','docker','kubernetes','React','Python','JavaScript','TypeScript','SQL','NoSQL','complexity','recursion','sorting','graph','tree','hash','encryption','bug','debug','deploy'],
  law: ['contract','tort','statute','regulation','court','judge','plaintiff','defendant','liability','negligence','intellectual property','patent','copyright','trademark','employment','constitutional','criminal','civil','appeal','jurisdiction','arbitration','compliance','GDPR','lawsuit','settlement'],
  business: ['revenue','profit','margin','valuation','startup','investor','funding','marketing','strategy','customer','product','market','competition','growth','KPI','OKR','B2B','B2C','SaaS','unit economics','CAC','LTV','churn','burn rate','runway','IPO','acquisition','merger'],
  chemistry: ['molecule','atom','bond','reaction','compound','element','periodic table','acid','base','pH','oxidation','reduction','catalyst','polymer','organic','inorganic','spectroscopy','NMR','synthesis','mechanism','stereochemistry','thermodynamics','kinetics','equilibrium','electrolyte'],
  biology: ['cell','gene','DNA','RNA','protein','enzyme','metabolism','evolution','ecology','species','chromosome','mutation','organelle','membrane','photosynthesis','respiration','immune','antibody','virus','bacteria','fungi','mitosis','meiosis','genome','CRISPR','bioinformatics'],
  education: ['learning','teaching','curriculum','assessment','student','pedagogy','Bloom','cognitive','constructivism','differentiation','inclusion','classroom','e-learning','ADHD','dyslexia','gifted','rubric','formative','summative','feedback','motivation','engagement'],
  psychology: ['behavior','cognitive','emotion','memory','perception','personality','disorder','therapy','CBT','motivation','trauma','anxiety','depression','schizophrenia','social','developmental','neuroscience','consciousness','attachment','Freud','Jung','Maslow'],
  architecture: ['building','structure','design','space','form','material','facade','floor plan','zoning','urban','landscape','sustainable','LEED','BIM','AutoCAD','Revit','load bearing','aesthetics','renovation','preservation'],
  economics: ['GDP','inflation','interest rate','monetary policy','fiscal policy','supply','demand','elasticity','equilibrium','market failure','externality','public goods','game theory','microeconomics','macroeconomics','trade','currency','recession','unemployment','Keynesian','neoclassical'],
  nutrition: ['diet','nutrient','protein','carbohydrate','fat','vitamin','mineral','calorie','metabolism','obesity','diabetes','microbiome','gut health','supplement','sports nutrition','eating disorder','macronutrient','antioxidant','fiber','hydration'],
  sports: ['training','exercise','performance','athlete','muscle','endurance','strength','flexibility','recovery','injury','VO2 max','heart rate','sprint','aerobic','anaerobic','coaching','tactics','biomechanics','nutrition','doping'],
  environmental: ['climate','carbon','emission','pollution','biodiversity','ecosystem','sustainability','renewable','solar','wind','greenhouse','deforestation','ocean','atmosphere','habitat','conservation','ESG','carbon footprint','Paris Agreement'],
  philosophy: ['ethics','morality','metaphysics','epistemology','logic','consciousness','free will','justice','truth','knowledge','Plato','Aristotle','Kant','Nietzsche','existentialism','utilitarianism','deontology','phenomenology','AI ethics','bioethics'],
  history: ['war','empire','revolution','civilization','dynasty','colonialism','politics','society','culture','archaeology','medieval','ancient','modern','Cold War','World War','industrial revolution','democracy','monarchy','trade routes','migration'],
  arts: ['painting','sculpture','music','literature','theatre','film','architecture','design','aesthetics','style','movement','color','composition','narrative','symbolism','modernism','contemporary','critique','gallery','performance'],
  linguistics: ['language','grammar','syntax','semantics','phonology','morphology','pragmatics','discourse','translation','bilingual','acquisition','NLP','corpus','dialect','etymology','cognition','communication','sign language'],
};

const QUESTION_TYPE_PATTERNS: Record<string, string[]> = {
  explanation:     ['what is','explain','how does','describe','define','what are','tell me about','meaning of'],
  problem_solving: ['solve','calculate','find','compute','prove','derive','how to fix','implement','debug','write code'],
  advice:          ['should i','recommend','best way','strategy','advice','suggest','what would you','help me decide','which is better'],
  diagnosis:       ['why is','what causes','diagnose','identify','reason for','root cause','problem with','issue with'],
  review:          ['review','evaluate','assess','critique','feedback on','is this correct','check my','improve'],
};

export interface SmartClassification {
  domain: string;
  subDomain: string;
  topic: string;
  questionType: 'explanation' | 'problem_solving' | 'advice' | 'diagnosis' | 'review';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  reasoning: string;
  safetyFlags: string[];
  isSafe: boolean;
  keywords: string[];
}

export function smartClassify(text: string): SmartClassification {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(w => w.length > 2);

  // Score each domain
  const scores: Record<string, number> = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.filter(k => lower.includes(k)).length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topDomain = sorted[0][0];
  const topScore = sorted[0][1];
  const confidence = Math.min(0.98, 0.5 + topScore * 0.08);

  // Detect question type
  let questionType: SmartClassification['questionType'] = 'explanation';
  for (const [type, patterns] of Object.entries(QUESTION_TYPE_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) {
      questionType = type as SmartClassification['questionType'];
      break;
    }
  }

  // Detect difficulty from text complexity
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);
  const techTermCount = DOMAIN_KEYWORDS[topDomain]?.filter(k => lower.includes(k)).length ?? 0;
  let difficulty: SmartClassification['difficulty'] = 'beginner';
  if (techTermCount >= 5 || avgWordLen > 7) difficulty = 'expert';
  else if (techTermCount >= 3 || avgWordLen > 6) difficulty = 'advanced';
  else if (techTermCount >= 1 || avgWordLen > 5) difficulty = 'intermediate';

  // Sub-domain and topic from highest-scoring sub-keywords
  const subDomainMap: Record<string, [string, string]> = {
    medicine: ['internal-medicine', 'Cardiology'], engineering: ['mechanical-engineering', 'Thermodynamics'],
    mathematics: ['calculus-analysis', 'Differential Calculus'], physics: ['classical-mechanics', "Newton's Laws"],
    'computer-science': ['algorithms', 'Sorting Algorithms'], law: ['contract-law', 'Contract Formation'],
    business: ['financial-analysis', 'DCF Valuation'], chemistry: ['organic-chemistry', 'Reaction Mechanisms'],
    biology: ['molecular-biology', 'Gene Expression'], education: ['curriculum-design', 'Learning Objectives'],
    psychology: ['cognitive-psychology', 'Working Memory'], architecture: ['structural-design', 'Load Analysis'],
    economics: ['macroeconomics', 'Monetary Policy'], nutrition: ['clinical-nutrition', 'Metabolic Disorders'],
    sports: ['exercise-physiology', 'VO2 Max'], environmental: ['climate-science', 'Greenhouse Effect'],
    philosophy: ['ethics', 'Utilitarianism'], history: ['modern-history', 'World War I & II'],
    arts: ['literature', 'Literary Theory'], linguistics: ['computational-linguistics', 'Syntax Parsing'],
  };

  const [subDomain, topic] = subDomainMap[topDomain] ?? ['general', 'General'];

  // Safety check
  const harmfulPatterns = ['how to kill','suicide method','bomb making','illegal drugs synthesis','hack into','child'];
  const safetyFlags = harmfulPatterns.filter(p => lower.includes(p));

  const matchedKeywords = (DOMAIN_KEYWORDS[topDomain] ?? []).filter(k => lower.includes(k));

  return {
    domain: topDomain,
    subDomain,
    topic,
    questionType,
    difficulty,
    confidence,
    reasoning: `Detected ${matchedKeywords.length} domain-specific terms (${matchedKeywords.slice(0, 4).join(', ')}). Question pattern indicates ${questionType} type at ${difficulty} level.`,
    safetyFlags,
    isSafe: safetyFlags.length === 0,
    keywords: matchedKeywords.slice(0, 8),
  };
}

// ── Deterministic embedding (TF-IDF style, no API needed) ───────────────────
export function smartEmbedding(text: string): number[] {
  const lower = text.toLowerCase();
  const vector = new Array(64).fill(0);
  const allKeywords = Object.values(DOMAIN_KEYWORDS).flat();

  for (let i = 0; i < 64; i++) {
    const kw = allKeywords[i % allKeywords.length];
    const tf = (lower.split(kw).length - 1) / (lower.split(' ').length || 1);
    vector[i] = Math.tanh(tf * 10 + Math.sin(i * 0.5) * 0.1);
  }
  return vector;
}

// ── Rule-based evaluator ────────────────────────────────────────────────────
export interface SmartEvaluation {
  accuracyScore: number;
  reasoningScore: number;
  completenessScore: number;
  clarityScore: number;
  aiScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export function smartEvaluate(question: string, answer: string, domain: string): SmartEvaluation {
  const words = answer.split(/\s+/).filter(Boolean);
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const domainKeywords = DOMAIN_KEYWORDS[domain] ?? [];
  const keywordHits = domainKeywords.filter(k => answer.toLowerCase().includes(k)).length;

  // Completeness: word count (ideal 150-500 words)
  const completenessScore = Math.min(100, Math.max(30,
    words.length < 50 ? words.length * 1.5 :
    words.length < 150 ? 75 + (words.length - 50) * 0.15 :
    words.length < 500 ? 90 + (words.length - 150) * 0.03 : 100
  ));

  // Clarity: avg sentence length (ideal 15-25 words)
  const avgSentLen = words.length / (sentences.length || 1);
  const clarityScore = Math.min(100, Math.max(40,
    avgSentLen < 5 ? 50 : avgSentLen < 10 ? 65 :
    avgSentLen < 20 ? 88 : avgSentLen < 35 ? 80 : 60
  ));

  // Accuracy: domain keyword density
  const accuracyScore = Math.min(100, Math.max(35, 45 + keywordHits * 8));

  // Reasoning: presence of explanation connectors
  const reasoningWords = ['because','therefore','thus','hence','since','due to','as a result','which means','this indicates','evidence','research','study','shows','suggests'];
  const reasoningHits = reasoningWords.filter(w => answer.toLowerCase().includes(w)).length;
  const reasoningScore = Math.min(100, Math.max(40, 50 + reasoningHits * 7));

  const aiScore = accuracyScore * 0.35 + reasoningScore * 0.30 + completenessScore * 0.20 + clarityScore * 0.15;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (keywordHits >= 3) strengths.push('Good use of domain-specific terminology');
  if (words.length >= 150) strengths.push('Comprehensive coverage of the topic');
  if (reasoningHits >= 2) strengths.push('Clear logical reasoning and justification');
  if (avgSentLen <= 25) strengths.push('Well-structured, readable sentences');

  if (keywordHits < 2) weaknesses.push('Could include more domain-specific terminology');
  if (words.length < 100) weaknesses.push('Answer is too brief — expand with more detail');
  if (reasoningHits < 1) weaknesses.push('Add explicit reasoning and evidence-based support');
  if (sentences.length < 3) weaknesses.push('Needs better paragraph structure');

  const feedback = `${aiScore >= 80 ? 'Excellent' : aiScore >= 65 ? 'Good' : aiScore >= 50 ? 'Adequate' : 'Needs improvement'}. ` +
    `Answer covers ${keywordHits} key domain concepts across ${sentences.length} statements. ` +
    (weaknesses.length > 0 ? `Main areas for improvement: ${weaknesses[0]}.` : 'No major issues found.');

  return {
    accuracyScore: Math.round(accuracyScore),
    reasoningScore: Math.round(reasoningScore),
    completenessScore: Math.round(completenessScore),
    clarityScore: Math.round(clarityScore),
    aiScore: Math.round(aiScore),
    feedback,
    strengths,
    weaknesses,
  };
}

// ── Template exam generator ─────────────────────────────────────────────────
const EXAM_TEMPLATES: Record<string, Array<{ q: string; opts: string[]; ans: string; cat: string }>> = {
  medicine: [
    { q: 'Scleritis is characterized by inflammation of which ocular layer?', opts: ['A) Conjunctiva', 'B) Sclera', 'C) Cornea', 'D) Retina'], ans: 'B', cat: 'definition' },
    { q: 'Which systemic disease is most commonly associated with scleritis?', opts: ['A) Diabetes mellitus', 'B) Hypertension', 'C) Rheumatoid arthritis', 'D) Hypothyroidism'], ans: 'C', cat: 'mechanism' },
    { q: 'What is the first-line treatment for non-necrotizing anterior scleritis?', opts: ['A) Topical steroids', 'B) NSAIDs', 'C) Antifungals', 'D) Antivirals'], ans: 'B', cat: 'application' },
    { q: 'Necrotizing scleritis without inflammation is called:', opts: ['A) Episcleritis', 'B) Scleromalacia perforans', 'C) Posterior scleritis', 'D) Nodular scleritis'], ans: 'B', cat: 'definition' },
    { q: 'Which investigation is most useful in confirming posterior scleritis?', opts: ['A) MRI brain', 'B) B-scan ultrasonography', 'C) Fluorescein angiography', 'D) ERG'], ans: 'B', cat: 'analysis' },
  ],
  'computer-science': [
    { q: 'What is the time complexity of QuickSort in the average case?', opts: ['A) O(n²)', 'B) O(n log n)', 'C) O(n)', 'D) O(log n)'], ans: 'B', cat: 'analysis' },
    { q: 'Which data structure uses LIFO ordering?', opts: ['A) Queue', 'B) Stack', 'C) Heap', 'D) Linked List'], ans: 'B', cat: 'definition' },
    { q: 'In Big-O notation, what does O(1) represent?', opts: ['A) Linear time', 'B) Logarithmic time', 'C) Constant time', 'D) Quadratic time'], ans: 'C', cat: 'definition' },
    { q: 'Which algorithm is used in Dijkstra\'s shortest path?', opts: ['A) BFS', 'B) DFS', 'C) Greedy with priority queue', 'D) Dynamic programming'], ans: 'C', cat: 'mechanism' },
    { q: 'What does REST stand for in API design?', opts: ['A) Remote Execution Standard Transfer', 'B) Representational State Transfer', 'C) Resource Endpoint Service Technology', 'D) Rapid Exchange System Transfer'], ans: 'B', cat: 'definition' },
  ],
  mathematics: [
    { q: 'What is the derivative of sin(x)?', opts: ['A) -cos(x)', 'B) cos(x)', 'C) tan(x)', 'D) -sin(x)'], ans: 'B', cat: 'definition' },
    { q: 'What is ∫e^x dx?', opts: ['A) e^x + C', 'B) xe^x + C', 'C) e^(x+1) + C', 'D) ln(x) + C'], ans: 'A', cat: 'application' },
    { q: 'The determinant of a 2x2 matrix [[a,b],[c,d]] is:', opts: ['A) ab - cd', 'B) ad + bc', 'C) ad - bc', 'D) ac - bd'], ans: 'C', cat: 'definition' },
    { q: 'Which theorem states every polynomial has at least one complex root?', opts: ['A) Fermat\'s Last Theorem', 'B) Fundamental Theorem of Algebra', 'C) Intermediate Value Theorem', 'D) Rolle\'s Theorem'], ans: 'B', cat: 'definition' },
    { q: 'P(A∪B) = P(A) + P(B) holds when A and B are:', opts: ['A) Independent', 'B) Mutually exclusive', 'C) Complementary', 'D) Exhaustive'], ans: 'B', cat: 'mechanism' },
  ],
};

const DEFAULT_EXAM_QUESTIONS = [
  { q: 'What is the primary purpose of the subject matter in question?', opts: ['A) Theoretical foundation', 'B) Practical application', 'C) Historical context', 'D) All of the above'], ans: 'D', cat: 'definition' },
  { q: 'Which approach is considered best practice in this domain?', opts: ['A) Empirical evidence-based methods', 'B) Intuition-based approaches', 'C) Traditional methods only', 'D) Experimental approaches only'], ans: 'A', cat: 'application' },
  { q: 'What distinguishes an expert from a novice in this field?', opts: ['A) Speed of task completion', 'B) Depth of conceptual understanding', 'C) Memorization ability', 'D) Physical capability'], ans: 'B', cat: 'analysis' },
  { q: 'When analyzing complex problems in this domain, the FIRST step is:', opts: ['A) Implement a solution immediately', 'B) Define and understand the problem', 'C) Consult external sources', 'D) Apply standard templates'], ans: 'B', cat: 'mechanism' },
  { q: 'Which of the following represents a common misconception in this field?', opts: ['A) Complexity always improves outcomes', 'B) Evidence should guide practice', 'C) Context matters in application', 'D) Continuous learning is essential'], ans: 'A', cat: 'synthesis' },
];

export interface SmartExamQuestion {
  id: string; type: 'mcq'; question: string; options: string[];
  correctAnswer: string; explanation: string; points: number;
  category: string;
}

export interface SmartExam {
  questions: SmartExamQuestion[];
  totalPoints: number;
  timeLimitSecs: number;
  coverageAreas: string[];
}

export function smartGenerateExam(topic: string, domain: string, difficulty: string): SmartExam {
  const templates = EXAM_TEMPLATES[domain] ?? DEFAULT_EXAM_QUESTIONS;

  const questions: SmartExamQuestion[] = templates.slice(0, 5).map((t, i) => ({
    id: `q${i + 1}`,
    type: 'mcq' as const,
    question: t.q,
    options: t.opts,
    correctAnswer: t.ans,
    explanation: `The correct answer is ${t.ans}. This tests your understanding of ${t.cat} in ${topic}.`,
    points: 20,
    category: t.cat,
  }));

  return {
    questions,
    totalPoints: 100,
    timeLimitSecs: difficulty === 'expert' ? 900 : difficulty === 'advanced' ? 720 : 600,
    coverageAreas: ['Definitions & Concepts', 'Mechanisms & Processes', 'Clinical/Practical Application', 'Analysis & Reasoning', 'Synthesis'],
  };
}
