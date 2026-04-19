export type Lang = 'en' | 'ar' | 'ku';

export const LANGUAGES: Record<Lang, { label: string; dir: 'ltr' | 'rtl'; flag: string; font: string }> = {
  en: { label: 'English',  dir: 'ltr', flag: '🇬🇧', font: 'Inter, sans-serif' },
  ar: { label: 'العربية', dir: 'rtl', flag: '🇸🇦', font: '"Noto Sans Arabic", sans-serif' },
  ku: { label: 'کوردی',   dir: 'rtl', flag: '🏳️', font: '"Noto Sans Arabic", sans-serif' },
};

export const T = {
  // ── Navigation ──────────────────────────────────────────────────────────
  nav_dashboard:     { en: 'Dashboard',      ar: 'لوحة التحكم',     ku: 'داشبۆرد' },
  nav_ask:           { en: 'Ask a Question', ar: 'اطرح سؤالاً',     ku: 'پرسیار بکە' },
  nav_competitions:  { en: 'Competitions',   ar: 'المسابقات',       ku: 'پێشبڕکێکان' },
  nav_experts:       { en: 'Experts',        ar: 'الخبراء',         ku: 'پسپۆڕەکان' },
  nav_rewards:       { en: 'Rewards',        ar: 'المكافآت',        ku: 'خەڵاتەکان' },

  // ── Dashboard ───────────────────────────────────────────────────────────
  dash_title:        { en: 'Dashboard',                  ar: 'لوحة التحكم',               ku: 'داشبۆرد' },
  dash_subtitle:     { en: 'AI-powered knowledge competition platform', ar: 'منصة مسابقات المعرفة المدعومة بالذكاء الاصطناعي', ku: 'پلاتفۆرمی پێشبڕکێی زانستی بە هۆشی دەستکرد' },
  dash_experts:      { en: 'Total Experts',              ar: 'إجمالي الخبراء',            ku: 'کۆی پسپۆڕەکان' },
  dash_domains:      { en: 'Domains',                    ar: 'المجالات',                  ku: 'بواڕەکان' },
  dash_active:       { en: 'Active Competitions',        ar: 'المسابقات النشطة',          ku: 'پێشبڕکێی چالاک' },
  dash_submissions:  { en: 'Total Submissions',          ar: 'إجمالي الإجابات',           ku: 'کۆی وەڵامەکان' },
  dash_top_experts:  { en: 'Top Experts',                ar: 'أفضل الخبراء',              ku: 'باشترین پسپۆڕەکان' },
  dash_recent:       { en: 'Recent Competitions',        ar: 'المسابقات الأخيرة',         ku: 'پێشبڕکێی دواتر' },
  dash_how:          { en: 'How It Works',               ar: 'كيف يعمل',                  ku: 'چۆن کار دەکات' },

  // ── How it works steps ──────────────────────────────────────────────────
  step_ask:          { en: 'Ask',            ar: 'اسأل',            ku: 'بپرسە' },
  step_ask_desc:     { en: 'Submit your question or problem', ar: 'أرسل سؤالك أو مشكلتك', ku: 'پرسیار یان کێشەکەت بنێرە' },
  step_ai:           { en: 'AI Analysis',   ar: 'تحليل ذكاء اصطناعي', ku: 'شیکاری هۆشی دەستکرد' },
  step_ai_desc:      { en: 'AI classifies and routes to experts', ar: 'الذكاء الاصطناعي يصنف ويوجه للخبراء', ku: 'هۆشی دەستکرد ڕێنووسی دەکات' },
  step_experts:      { en: 'Experts Answer',ar: 'يجيب الخبراء',    ku: 'پسپۆڕەکان وەڵام دەدەنەوە' },
  step_experts_desc: { en: 'Top matched experts compete', ar: 'أفضل الخبراء يتنافسون', ku: 'باشترین پسپۆڕەکان پێشبڕکێ دەکەن' },
  step_eval:         { en: 'AI Evaluation', ar: 'تقييم الذكاء الاصطناعي', ku: 'هەڵسەنگاندنی هۆشی دەستکرد' },
  step_eval_desc:    { en: 'Accuracy, reasoning, completeness scored', ar: 'تقييم الدقة والمنطق والشمولية', ku: 'تەواوی و ڕاستی هەڵدەسەنگێندرێت' },
  step_exam:         { en: 'Mini Exam',     ar: 'اختبار مصغر',     ku: 'تاقیکردنەوەی بچووک' },
  step_exam_desc:    { en: 'Experts prove deep understanding', ar: 'الخبراء يثبتون فهمهم العميق', ku: 'پسپۆڕەکان تێگەیشتنی قووڵیان دەپشکنن' },
  step_rank:         { en: 'Ranking',       ar: 'التصنيف',         ku: 'ریزبەندی' },
  step_rank_desc:    { en: 'Best answer selected by AI + Exam + Rating', ar: 'أفضل إجابة تُختار بالذكاء الاصطناعي', ku: 'باشترین وەڵام هەڵدەبژێردرێت' },
  step_reward:       { en: 'Win & Reward',  ar: 'الفوز والمكافأة', ku: 'برد و خەڵات' },
  step_reward_desc:  { en: 'Winner earns points redeemable for cash', ar: 'الفائز يكسب نقاطاً قابلة للصرف', ku: 'بەرنامی خاڵ وەردەگرێت' },

  // ── Ask Question ────────────────────────────────────────────────────────
  ask_title:         { en: 'Ask a Question',       ar: 'اطرح سؤالاً',          ku: 'پرسیار بکە' },
  ask_subtitle:      { en: 'AI will classify your question and route it to best matching experts', ar: 'سيقوم الذكاء الاصطناعي بتصنيف سؤالك وتوجيهه للخبراء', ku: 'هۆشی دەستکرد پرسیارەکەت دابەشدەکات بۆ پسپۆڕەکان' },
  ask_label_title:   { en: 'Question Title *',     ar: 'عنوان السؤال *',       ku: 'سەردێڕی پرسیار *' },
  ask_placeholder_t: { en: 'e.g. How does quantum entanglement work?', ar: 'مثال: كيف يعمل التشابك الكمي؟', ku: 'نمونە: چۆن تێگەیشتن کار دەکات؟' },
  ask_label_desc:    { en: 'Detailed Description *', ar: 'الوصف التفصيلي *',   ku: 'وەسفی وردبینی *' },
  ask_placeholder_d: { en: 'Provide as much context as possible...', ar: 'قدم أكبر قدر ممكن من السياق...', ku: 'زۆرترین زانیاری دابین بکە...' },
  ask_urgency:       { en: 'Urgency',              ar: 'الأولوية',             ku: 'گرنگی' },
  ask_low:           { en: 'Low',                  ar: 'منخفض',               ku: 'کەم' },
  ask_normal:        { en: 'Normal',               ar: 'عادي',                ku: 'ئاسایی' },
  ask_high:          { en: 'High',                 ar: 'عالٍ',                ku: 'بەرز' },
  ask_critical:      { en: 'Critical',             ar: 'حرج',                 ku: 'زۆر گرنگ' },
  ask_submit:        { en: '🚀 Submit & Start Competition', ar: '🚀 أرسل وابدأ المسابقة', ku: '🚀 بنێرە و پێشبڕکێ دەستپێبکە' },
  ask_analyzing:     { en: 'AI Analyzing Your Question', ar: 'الذكاء الاصطناعي يحلل سؤالك', ku: 'هۆشی دەستکرد پرسیارەکەت شیدەکاتەوە' },
  ask_analyzing_sub: { en: 'Detecting domain, routing to experts...', ar: 'تحديد المجال، توجيه الخبراء...', ku: 'دیاریکردنی بوار، ناردن بۆ پسپۆڕەکان...' },
  ask_done_title:    { en: 'AI Analysis Complete', ar: 'اكتمل تحليل الذكاء الاصطناعي', ku: 'شیکاری هۆشی دەستکرد تەواو بوو' },
  ask_another:       { en: 'Ask Another',          ar: 'اطرح سؤالاً آخر',     ku: 'پرسیاری تر بکە' },
  ask_comp_started:  { en: 'Competition Started!', ar: 'بدأت المسابقة!',      ku: 'پێشبڕکێ دەستپێکرد!' },

  // ── Analysis Result ─────────────────────────────────────────────────────
  result_domain:     { en: 'Domain',       ar: 'المجال',     ku: 'بوار' },
  result_subdomain:  { en: 'Sub-Domain',   ar: 'المجال الفرعي', ku: 'بواری لاوەکی' },
  result_topic:      { en: 'Topic',        ar: 'الموضوع',    ku: 'بابەت' },
  result_qtype:      { en: 'Question Type',ar: 'نوع السؤال', ku: 'جۆری پرسیار' },
  result_difficulty: { en: 'Difficulty',   ar: 'الصعوبة',    ku: 'قووڵی' },
  result_confidence: { en: 'Confidence',   ar: 'الثقة',      ku: 'متمانە' },
  result_reasoning:  { en: 'AI Reasoning', ar: 'تفكير الذكاء الاصطناعي', ku: 'ئازموونی هۆشی دەستکرد' },
  result_matched:    { en: 'Matched Experts', ar: 'الخبراء المتطابقون', ku: 'پسپۆڕە تاکتیکییەکان' },
  result_similarity: { en: 'Similarity',   ar: 'التشابه',    ku: 'هاوشێوەیی' },

  // ── Experts ─────────────────────────────────────────────────────────────
  exp_title:         { en: 'Expert Directory',    ar: 'دليل الخبراء',        ku: 'ڕووپێوی پسپۆڕەکان' },
  exp_search:        { en: 'Search experts...',   ar: 'ابحث عن الخبراء...',  ku: 'گەڕان بۆ پسپۆڕ...' },
  exp_all_domains:   { en: 'All Domains',         ar: 'جميع المجالات',       ku: 'هەموو بواڕەکان' },
  exp_verified:      { en: 'Verified only',       ar: 'موثقون فقط',         ku: 'دڵنیاکراوەکان تەنها' },
  exp_experience:    { en: 'experience',          ar: 'خبرة',               ku: 'ئەزموون' },
  exp_wins:          { en: 'wins',                ar: 'انتصارات',           ku: 'بردنەوە' },
  exp_reviews:       { en: 'reviews',             ar: 'تقييمات',            ku: 'هەڵسەنگاندن' },
  exp_available:     { en: 'Available',           ar: 'متاح',               ku: 'بەردەست' },
  exp_busy:          { en: 'Busy',                ar: 'مشغول',              ku: 'بەکارهاتوو' },

  // ── Competitions ────────────────────────────────────────────────────────
  comp_title:        { en: 'Knowledge Competitions', ar: 'مسابقات المعرفة',   ku: 'پێشبڕکێی زانیاری' },
  comp_all:          { en: 'All',                    ar: 'الكل',             ku: 'هەموو' },
  comp_pending:      { en: 'Pending',                ar: 'قيد الانتظار',     ku: 'چاوەڕوانە' },
  comp_active:       { en: 'Active',                 ar: 'نشط',             ku: 'چالاک' },
  comp_exam:         { en: 'Exam',                   ar: 'اختبار',           ku: 'تاقیکردنەوە' },
  comp_done:         { en: 'Done',                   ar: 'مكتمل',           ku: 'تەواو' },
  comp_answers:      { en: 'answers',                ar: 'إجابات',          ku: 'وەڵام' },
  comp_points:       { en: 'points',                 ar: 'نقاط',            ku: 'خاڵ' },
  no_consultations:  { en: 'No consultations found', ar: 'لا توجد استشارات',  ku: 'هیچ ئامۆژگاریەک نەدۆزرایەوە' },

  // ── Rewards ─────────────────────────────────────────────────────────────
  rew_title:         { en: 'Rewards & Points',      ar: 'المكافآت والنقاط',    ku: 'خەڵات و خاڵەکان' },
  rew_subtitle:      { en: 'Win competitions to earn points, watch ads, convert to money', ar: 'اربح مسابقات، شاهد إعلانات، حوّل إلى نقود', ku: 'پێشبڕکێ ببرە، خاڵ وەربگرە، بگۆڕە بۆ پارە' },
  rew_total_pts:     { en: 'Total Points',           ar: 'إجمالي النقاط',       ku: 'کۆی خاڵەکان' },
  rew_money:         { en: 'Money Value',            ar: 'القيمة النقدية',      ku: 'بەهای پارەکە' },
  rew_claimable:     { en: 'Claimable Rewards',      ar: 'المكافآت القابلة للمطالبة', ku: 'خەڵاتی وەرگرتنی' },
  rew_claim:         { en: 'Claim',                  ar: 'استلام',             ku: 'وەربگرە' },
  rew_claimed:       { en: 'Claimed',                ar: 'تم الاستلام',        ku: 'وەرگیرا' },
  rew_watch_ad:      { en: 'Watch a Short Ad',       ar: 'شاهد إعلاناً قصيراً', ku: 'ڕیکلامێکی کورت ببینە' },
  rew_watch_claim:   { en: 'Watch & Claim Points',   ar: 'شاهد واستلم النقاط', ku: 'ببینە و خاڵ وەربگرە' },
  rew_rate:          { en: 'Conversion Rate: 1000 points = $1.00', ar: 'معدل التحويل: 1000 نقطة = 1 دولار', ku: 'ڕێژەی گۆڕین: 1000 خاڵ = 1 دۆلار' },
  rew_min:           { en: 'Minimum withdrawal: 10,000 pts ($10)', ar: 'الحد الأدنى للسحب: 10,000 نقطة', ku: 'کەمترین ڕاکێشان: 10,000 خاڵ' },
  rew_no_rewards:    { en: 'No rewards yet. Win competitions to earn points!', ar: 'لا توجد مكافآت بعد. اربح مسابقات!', ku: 'هێشتا خەڵات نییە. پێشبڕکێ ببرە!' },

  // ── Common ──────────────────────────────────────────────────────────────
  prev:              { en: 'Prev',    ar: 'السابق',  ku: 'پێشوو' },
  next:              { en: 'Next',    ar: 'التالي',  ku: 'دواتر' },
  page:              { en: 'Page',    ar: 'صفحة',    ku: 'لاپەڕە' },
  of:                { en: 'of',      ar: 'من',      ku: 'لە' },
  loading:           { en: 'Loading...', ar: 'جارٍ التحميل...', ku: 'بارکردن...' },
  years:             { en: 'yrs',     ar: 'سنوات',  ku: 'ساڵ' },
  demo_user:         { en: 'Demo User', ar: 'مستخدم تجريبي', ku: 'بەکارهێنەری نموونە' },
  pts:               { en: 'pts',     ar: 'نقطة',   ku: 'خاڵ' },
  safety_warning:    { en: '⚠️ Safety Warning', ar: '⚠️ تحذير أمان', ku: '⚠️ ئاگاداری ئایمەنی' },
} as const;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  return (T[key] as Record<Lang, string>)[lang] ?? (T[key] as Record<Lang, string>)['en'];
}
