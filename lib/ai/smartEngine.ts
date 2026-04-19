/**
 * Smart rule-based AI engine — no external API calls.
 * Supports English, Arabic (العربية), and Kurdish (کوردی).
 */

// ── Arabic keyword maps ─────────────────────────────────────────────────────
const ARABIC_DOMAIN_KEYWORDS: Record<string, string[]> = {
  medicine:          ['مرض','أعراض','تشخيص','علاج','مريض','دواء','جراحة','طبيب','مستشفى','عيادة','عدوى','فيروس','بكتيريا','سرطان','قلب','دم','مخ','رئة','كبد','كلية','التهاب','حمى','ألم','صيدلانية','تشريح','أمراض','أشعة','صداع','ضغط','سكري','ربو','صيدلة','تمريض'],
  engineering:       ['هندسة','تصميم','إنشاء','خرسانة','فولاذ','جسر','حمل','إجهاد','أساس','ميكانيكي','كهربائي','كيميائي','مدني','تصنيع','لحام','توربين','ضغط','قدرة','دائرة','مقاومة'],
  mathematics:       ['رياضيات','معادلة','تفاضل','تكامل','مصفوفة','متجه','كثيرة حدود','إحصاء','احتمال','هندسة','جبر','نظرية','برهان','حد','متسلسلة','خطي','مشتقة'],
  physics:           ['فيزياء','قوة','طاقة','زخم','كم','موجة','جسيم','نسبية','جاذبية','كهرمغناطيسي','حرارة','إنتروبيا','فوتون','إلكترون','نواة','ذرة','تردد','بصريات','سرعة','تسارع'],
  'computer-science':['خوارزمية','برمجة','كود','برنامج','قاعدة بيانات','شبكة','أمن','تعلم آلي','ذكاء اصطناعي','شبكة عصبية','بايثون','جافاسكريبت','سحابة','تشفير','خادم','واجهة برمجية'],
  law:               ['قانون','عقد','محكمة','قاضٍ','دعوى','مسؤولية','ملكية فكرية','براءة اختراع','حقوق النشر','تشريع','دستور','جنائي','مدني','تحكيم','امتثال'],
  business:          ['أعمال','إيرادات','ربح','تقييم','شركة ناشئة','مستثمر','تمويل','تسويق','استراتيجية','عميل','منتج','سوق','نمو','اندماج','استحواذ'],
  chemistry:         ['كيمياء','جزيء','ذرة','تفاعل','مركب','عنصر','حمض','قاعدة','أكسدة','اختزال','محفز','بوليمر','عضوي','غير عضوي','طيف','تركيب'],
  biology:           ['أحياء','خلية','جين','حمض نووي','بروتين','إنزيم','تطور','بيئة','كروموسوم','طفرة','مناعة','فيروس','بكتيريا','جينوم','انقسام'],
  education:         ['تعليم','تدريس','مناهج','تقييم','طالب','تربية','معرفة','فصل دراسي','تعلم إلكتروني','دافعية','مشاركة','تغذية راجعة'],
  psychology:        ['علم نفس','سلوك','معرفة','عاطفة','ذاكرة','إدراك','شخصية','اضطراب','علاج','دافعية','صدمة','قلق','اكتئاب','اجتماعي'],
  economics:         ['اقتصاد','ناتج محلي','تضخم','سياسة نقدية','عرض','طلب','مرونة','توازن','تجارة','عملة','ركود','بطالة'],
  history:           ['تاريخ','حرب','إمبراطورية','ثورة','حضارة','استعمار','سياسة','مجتمع','ثقافة','قديم','حديث','ملكية'],
  philosophy:        ['فلسفة','أخلاق','ميتافيزيقا','منطق','وعي','حرية الإرادة','عدالة','حقيقة','معرفة'],
  arts:              ['فن','رسم','نحت','موسيقى','أدب','مسرح','سينما','جماليات','نقد','تصميم'],
};

// ── Kurdish (Sorani) keyword maps ───────────────────────────────────────────
const KURDISH_DOMAIN_KEYWORDS: Record<string, string[]> = {
  medicine:          ['نەخۆشی','نیشانە','تشخیص','چارەسەر','نەخۆش','دەرمان','نەشتەرگەری','پزیشک','نەخۆشخانە','گوێزراوە','ئەندامی','خوێن','مێشک','سەک','میانرووک','گورچیلە','تاوباری','ئازار','گەرمی','گرتنەبەر','لاشەپیزیشکی','ئەفرەتی'],
  engineering:       ['ئەندازیاری','دیزاین','دروستکردن','بەتۆن','پولاو','پرد','بار','بنکە','مەکانیکی','کارەبایی','کیمیایی','شاری'],
  mathematics:       ['ماتماتیک','هاوکێشە','ژمارە','ئامار','حیساب','نیگەبان','جەبر','ئەندازە','ئەحتیمال','ئامارکاری'],
  physics:           ['فیزیا','هێز','وزە','پێگەی وزە','گڕ','تیشک','ئاکرۆ','ئەرزیشت','کارەبا','گەرما','ئێلیکترۆن','ئاتۆم'],
  'computer-science':['کۆمپیوتەر','پرۆگرامکردن','کۆد','سۆفتوێر','داتابەیس','تۆڕ','ئەمنیەت','یتعلم ئۆتۆماتیکی','هۆشی دەستکرد','پایتۆن','سێور'],
  law:               ['یاسا','گرێبەست','دادگا','بڕیار','پاراستن','خاوەنداری','مافی ئەدەبی','دەستوور','تاوانی'],
  business:          ['بازرگانی','داهات','قازانج','بازار','کارمەند','فرۆشتن','گرنگیدان','مۆشتەری','بەرهەم'],
  chemistry:         ['کیمیا','مۆلیکول','ئاتۆم','تیکراوە','ئەسیتی','بنکە','ئۆکسیژن','کاتالیزەر'],
  biology:           ['بیۆلۆژیا','خانە','جین','دی ئێن ئەی','پرۆتین','ئینزیم','پەرەسەندن','ژینگە','کرۆموسۆم'],
  education:         ['پەروەردە','مامۆستایەتی','خوێندن','خوێندکار','پەیمانگا','فێرکردن','پەرەپێدان'],
  psychology:        ['دەروونناسی','ڕەفتار','زانست','هەست','بیرکردنەوە','کەسایەتی','دەروونپزیشکی'],
  economics:         ['ئابووری','بازار','بەها','داهات','کرێ','فرۆشتن','بازرگانی','دارایی'],
  history:           ['مێژوو','جەنگ','شارستانیەت','شۆڕش','سیاسەت','کۆمەڵگا','کۆن','نوێ'],
  philosophy:        ['فەلسەفە','ئەخلاق','لۆژیک','زانست','مافی مرۆڤ','دادپەروەری'],
  arts:              ['هونەر','وێنەکێشی','مووزیک','وێژە','شانۆ','سینەما','دیزاین'],
};

// ── English keyword maps ────────────────────────────────────────────────────
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

export function detectLanguage(text: string): 'ar' | 'ku' | 'en' {
  const arabicRange = /[\u0600-\u06FF]/g;
  const arabicMatches = (text.match(arabicRange) || []).length;
  if (arabicMatches < 3) return 'en';
  // Kurdish Sorani-specific letters not in standard Arabic
  const kurdishSpecific = /[\u06A9\u06AF\u0695\u06CC\u06BE\u0698]/g;
  const kurdishMatches = (text.match(kurdishSpecific) || []).length;
  return kurdishMatches >= 2 ? 'ku' : 'ar';
}

// Arabic/Kurdish question type patterns
const ARABIC_QUESTION_PATTERNS: Record<string, string[]> = {
  explanation:     ['ما هو','ما هي','اشرح','كيف يعمل','عرّف','ما معنى','أخبرني عن','وصف'],
  problem_solving: ['احسب','أوجد','حل','برهن','اشتق','كيف أصلح','نفّذ','اكتب كود'],
  advice:          ['هل يجب','أنصح','أفضل طريقة','استراتيجية','اقتراح','ماذا تقترح','أيهما أفضل'],
  diagnosis:       ['لماذا','ما سبب','شخّص','حدد','السبب الجذري','مشكلة في'],
  review:          ['راجع','قيّم','تقييم','هل هذا صحيح','تحقق من','حسّن'],
};

const KURDISH_QUESTION_PATTERNS: Record<string, string[]> = {
  explanation:     ['چییە','چۆنە','ڕوونکردنەوە','پێناسەکردن','چی مانایە','باسی'],
  problem_solving: ['چارەسەرکردن','دۆزینەوە','پرووفکردن','چۆن درووستبکەم'],
  advice:          ['پێشنیارکردن','باشترین ڕێگا','ئایا دەبێت','کامیان'],
  diagnosis:       ['بۆچی','هۆکاری','دیاریکردن','کێشەی'],
  review:          ['هەڵسەنگاندن','پشکنین','ئایا ڕاستە','باشترکردن'],
};

export function smartClassify(text: string): SmartClassification {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(w => w.length > 2);
  const detectedLang = detectLanguage(text);

  // Score each domain — combine English + Arabic/Kurdish keywords
  const scores: Record<string, number> = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const enScore = keywords.filter(k => lower.includes(k)).length;
    let i18nScore = 0;
    if (detectedLang === 'ar') {
      i18nScore = (ARABIC_DOMAIN_KEYWORDS[domain] ?? []).filter(k => text.includes(k)).length * 1.5;
    } else if (detectedLang === 'ku') {
      i18nScore = (KURDISH_DOMAIN_KEYWORDS[domain] ?? []).filter(k => text.includes(k)).length * 1.5;
    }
    scores[domain] = enScore + i18nScore;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topDomain = sorted[0][0];
  const topScore = sorted[0][1];
  const confidence = Math.min(0.98, 0.5 + topScore * 0.08);

  // Detect question type (English + Arabic + Kurdish patterns)
  let questionType: SmartClassification['questionType'] = 'explanation';
  const allTypePatterns = [
    QUESTION_TYPE_PATTERNS,
    detectedLang === 'ar' ? ARABIC_QUESTION_PATTERNS : {},
    detectedLang === 'ku' ? KURDISH_QUESTION_PATTERNS : {},
  ];
  outer: for (const patternSet of allTypePatterns) {
    for (const [type, patterns] of Object.entries(patternSet)) {
      if (patterns.some(p => lower.includes(p) || text.includes(p))) {
        questionType = type as SmartClassification['questionType'];
        break outer;
      }
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
    vector[i] = Math.tanh(tf * 10);
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

// ── Open-ended exam (replaces MCQ) ──────────────────────────────────────────

export interface OpenExamQuestion {
  id: string;
  question: string;
  hint: string;
  keywords: string[];
  points: number;
  category: string;
}

export interface OpenExam {
  questions: OpenExamQuestion[];
  totalPoints: number;
  timeLimitSecs: number;
  topic: string;
  domain: string;
}

const OPEN_EXAM_TEMPLATES: Record<string, Array<{ q: string; hint: string; keywords: string[]; cat: string }>> = {
  medicine: [
    { q: 'Briefly explain the mechanism by which NSAIDs reduce inflammation.', hint: 'Think COX enzymes, prostaglandins…', keywords: ['cox','prostaglandin','inflammation','cyclooxygenase','arachidonic','enzyme','inhibit','pain'], cat: 'mechanism' },
    { q: 'What are the key clinical features that distinguish Type 1 from Type 2 diabetes?', hint: 'Age of onset, insulin dependency, autoimmunity…', keywords: ['insulin','autoimmune','ketoacidosis','obesity','beta cell','resistance','juvenile','adult','pancreas'], cat: 'diagnosis' },
    { q: 'Name the immediate steps in managing a patient presenting with anaphylaxis.', hint: 'ABC, epinephrine, monitoring…', keywords: ['epinephrine','adrenaline','airway','oxygen','antihistamine','corticosteroid','iv','fluid','monitor','anaphylaxis'], cat: 'management' },
  ],
  law: [
    { q: 'Explain the key elements required to form a valid contract.', hint: 'Offer, acceptance, consideration…', keywords: ['offer','acceptance','consideration','capacity','intention','mutual assent','legal','binding','agreement'], cat: 'contract' },
    { q: 'What is the doctrine of precedent (stare decisis) and why is it important?', hint: 'Consistency, case law, court hierarchy…', keywords: ['precedent','binding','court','consistent','certainty','hierarchy','overrule','distinguish','stare decisis'], cat: 'principle' },
    { q: 'Describe the key differences between civil and criminal liability.', hint: 'Standard of proof, parties, remedies…', keywords: ['beyond reasonable doubt','balance of probabilities','plaintiff','damages','imprisonment','prosecution','state','civil','criminal'], cat: 'comparison' },
  ],
  'computer-science': [
    { q: 'Explain how a hash table handles collisions.', hint: 'Chaining, open addressing, load factor…', keywords: ['collision','chaining','open addressing','hash function','bucket','linear probing','load factor','rehash'], cat: 'data-structures' },
    { q: 'What is the difference between TCP and UDP? When would you use each?', hint: 'Reliability, speed, use cases…', keywords: ['reliable','connection','handshake','streaming','real-time','acknowledgment','packet loss','latency','udp','tcp'], cat: 'networking' },
    { q: 'Explain the SOLID principles in object-oriented design.', hint: 'Five principles of good software design…', keywords: ['single responsibility','open closed','liskov','interface segregation','dependency inversion','solid','design','principle'], cat: 'design' },
  ],
  mathematics: [
    { q: 'Explain the concept of a derivative and its geometric interpretation.', hint: 'Instantaneous rate of change, tangent line…', keywords: ['slope','tangent','instantaneous','rate of change','limit','differentiation','function','curve','derivative'], cat: 'calculus' },
    { q: 'What is the Central Limit Theorem and why is it important?', hint: 'Sample means, normal distribution…', keywords: ['normal distribution','sample mean','large sample','population','bell curve','convergence','probability','variance','statistics'], cat: 'statistics' },
    { q: 'Describe how matrix multiplication works and give a real-world application.', hint: 'Rows, columns, dot product…', keywords: ['row','column','dot product','transformation','linear','dimensions','compatible','matrix','application'], cat: 'linear-algebra' },
  ],
  engineering: [
    { q: "Explain Ohm's law and how it applies to circuit design.", hint: 'Voltage, current, resistance, power…', keywords: ['voltage','current','resistance','ohm','power','circuit','series','parallel','V=IR'], cat: 'electrical' },
    { q: 'What key factors guide material selection for a structural application?', hint: 'Strength, weight, cost, durability…', keywords: ['strength','yield','fatigue','corrosion','weight','cost','ductility','stiffness','thermal','material'], cat: 'materials' },
    { q: 'Describe the basic steps of the engineering design process.', hint: 'Define, research, prototype, test…', keywords: ['define','requirements','brainstorm','prototype','test','iterate','constraints','evaluate','design'], cat: 'process' },
  ],
  business: [
    { q: 'Explain SWOT analysis and its business application.', hint: 'Strengths, Weaknesses, Opportunities, Threats…', keywords: ['strengths','weaknesses','opportunities','threats','internal','external','strategy','competitive','swot'], cat: 'strategy' },
    { q: 'What is the difference between gross profit and net profit?', hint: 'Revenue, COGS, operating expenses…', keywords: ['revenue','cost of goods sold','operating expenses','gross margin','net income','overhead','profit','financial'], cat: 'finance' },
    { q: 'Describe key strategies a startup can use to achieve product-market fit.', hint: 'Customer discovery, iteration, metrics…', keywords: ['customer','feedback','iteration','pivot','retention','growth','value proposition','market','product'], cat: 'startup' },
  ],
  chemistry: [
    { q: 'Explain the difference between ionic and covalent bonding.', hint: 'Electronegativity, electron transfer vs sharing…', keywords: ['electronegativity','electron transfer','sharing','ionic','covalent','polar','lattice','molecule','bond'], cat: 'bonding' },
    { q: "What is Le Chatelier's principle? How does it apply to equilibrium?", hint: 'Stress, response, concentration changes…', keywords: ['equilibrium','stress','concentration','temperature','pressure','shift','le chatelier','reversible'], cat: 'equilibrium' },
    { q: 'Describe the mechanism of an SN2 reaction.', hint: 'Backside attack, leaving group, stereochemistry…', keywords: ['nucleophile','backside attack','leaving group','inversion','bimolecular','transition state','sn2','walden'], cat: 'organic' },
  ],
  biology: [
    { q: 'Explain the process of DNA replication and the key enzymes involved.', hint: 'Helicase, polymerase, primer…', keywords: ['helicase','dna polymerase','primer','primase','ligase','replication fork','leading strand','lagging strand','okazaki'], cat: 'molecular' },
    { q: 'What is natural selection and how does it drive evolution?', hint: 'Variation, fitness, adaptation…', keywords: ['variation','fitness','adaptation','survival','reproduction','selection pressure','allele','gene frequency','evolution'], cat: 'evolution' },
    { q: 'Describe the role of mitochondria in cellular respiration.', hint: 'ATP, electron transport chain, Krebs cycle…', keywords: ['atp','electron transport chain','krebs cycle','oxidative phosphorylation','nadh','mitochondria','glucose','oxygen'], cat: 'cell-biology' },
  ],
  psychology: [
    { q: 'Explain cognitive behavioral therapy (CBT) and its core principles.', hint: 'Thoughts, behaviors, emotions, distortions…', keywords: ['cognitive','behavioral','thoughts','distortions','behavior','emotion','restructuring','automatic thoughts','schema','cbt'], cat: 'therapy' },
    { q: "Describe Maslow's hierarchy of needs and its main criticisms.", hint: 'Five levels; cultural critiques…', keywords: ['physiological','safety','belonging','esteem','self-actualization','hierarchy','motivation','criticism','culture','maslow'], cat: 'motivation' },
    { q: 'What are the key differences between classical and operant conditioning?', hint: 'Pavlov vs Skinner, stimuli, reinforcement…', keywords: ['pavlov','skinner','reinforcement','punishment','stimulus','response','conditioned','unconditioned','operant'], cat: 'learning' },
  ],
  economics: [
    { q: 'Explain price elasticity of demand and give an example.', hint: 'Responsiveness, price changes, necessities vs luxuries…', keywords: ['elasticity','demand','price','percentage change','inelastic','elastic','substitute','necessity','luxury'], cat: 'microeconomics' },
    { q: 'What is monetary policy and how do central banks control inflation?', hint: 'Interest rates, money supply, open market…', keywords: ['interest rate','inflation','central bank','money supply','quantitative easing','open market','reserve','credit'], cat: 'macro' },
    { q: 'Describe key differences between perfect competition and monopoly.', hint: 'Price setting, barriers to entry, efficiency…', keywords: ['price taker','price maker','barriers to entry','efficiency','profit','market power','competition','consumer surplus'], cat: 'market-structures' },
  ],
  physics: [
    { q: "Explain Newton's three laws of motion with a real example for each.", hint: 'Inertia, F=ma, action-reaction…', keywords: ['inertia','force','mass','acceleration','reaction','momentum','velocity','F=ma','newton'], cat: 'mechanics' },
    { q: 'What is wave-particle duality in quantum mechanics?', hint: 'Double-slit, de Broglie, photons…', keywords: ['wave','particle','double slit','de broglie','photon','electron','quantum','interference','diffraction'], cat: 'quantum' },
    { q: 'Explain entropy and the second law of thermodynamics.', hint: 'Disorder, irreversibility, heat flow…', keywords: ['entropy','disorder','thermodynamics','irreversible','heat','energy','spontaneous','closed system'], cat: 'thermodynamics' },
  ],
};

const DEFAULT_OPEN_QUESTIONS = [
  { q: 'Explain the fundamental principles that govern this field and why they matter.', hint: 'Theory, practice, real-world applications…', keywords: ['principle','fundamental','practice','theory','application','method','approach','evidence','knowledge'], cat: 'foundation' },
  { q: 'Describe a common problem in this domain and the best approach to solve it.', hint: 'Diagnosis, analysis, solution methodology…', keywords: ['problem','solution','analyze','approach','method','identify','evaluate','improve','result','process'], cat: 'problem-solving' },
  { q: 'What are the most critical skills an expert in this field must master?', hint: 'Technical skills, analytical ability, domain knowledge…', keywords: ['skill','knowledge','expertise','experience','critical','analysis','domain','professional','master','competency'], cat: 'expertise' },
];

export function smartGenerateOpenExam(topic: string, domain: string, _difficulty: string): OpenExam {
  const templates = OPEN_EXAM_TEMPLATES[domain] ?? DEFAULT_OPEN_QUESTIONS;
  const questions: OpenExamQuestion[] = templates.slice(0, 3).map((t, i) => ({
    id: `q${i + 1}`,
    question: t.q,
    hint: t.hint,
    keywords: t.keywords,
    points: i < 2 ? 33 : 34,
    category: t.cat,
  }));

  return { questions, totalPoints: 100, timeLimitSecs: 25, topic, domain };
}

export function scoreOpenAnswer(answer: string, keywords: string[]): number {
  if (!answer || answer.trim().split(/\s+/).length < 4) return 0;
  const lower = answer.toLowerCase();
  const hits = keywords.filter(k => lower.includes(k.toLowerCase())).length;
  const words = answer.trim().split(/\s+/).length;
  const keywordScore = Math.min(60, Math.round((hits / Math.max(1, keywords.length)) * 60) + (hits >= 2 ? 10 : 0));
  const lengthScore = words < 5 ? 5 : words < 20 ? 15 : words < 50 ? 30 : words < 200 ? 40 : 35;
  return Math.min(100, keywordScore + lengthScore);
}
