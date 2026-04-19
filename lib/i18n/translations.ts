export type Lang = 'en' | 'ar' | 'ku' | 'tr';

export const LANGUAGES: Record<Lang, { label: string; dir: 'ltr' | 'rtl'; flag: string; font: string }> = {
  en: { label: 'English',  dir: 'ltr', flag: '🇬🇧', font: 'Inter, sans-serif' },
  ar: { label: 'العربية', dir: 'rtl', flag: '🇸🇦', font: '"Noto Sans Arabic", sans-serif' },
  ku: { label: 'کوردی',   dir: 'rtl', flag: '',    font: '"Noto Sans Arabic", sans-serif' },
  tr: { label: 'Türkçe',  dir: 'ltr', flag: '🇹🇷', font: 'Inter, sans-serif' },
};

export const T = {
  // ── Navigation ──────────────────────────────────────────────────────────
  nav_dashboard:     { en: 'Dashboard',      ar: 'لوحة التحكم',     ku: 'داشبۆرد',        tr: 'Panel' },
  nav_ask:           { en: 'Ask a Question', ar: 'اطرح سؤالاً',     ku: 'پرسیار بکە',     tr: 'Soru Sor' },
  nav_competitions:  { en: 'Competitions',   ar: 'المسابقات',       ku: 'پێشبڕکێکان',     tr: 'Yarışmalar' },
  nav_experts:       { en: 'Experts',        ar: 'الخبراء',         ku: 'پسپۆڕەکان',      tr: 'Uzmanlar' },
  nav_rewards:       { en: 'Rewards',        ar: 'المكافآت',        ku: 'خەڵاتەکان',      tr: 'Ödüller' },

  // ── Dashboard ───────────────────────────────────────────────────────────
  dash_title:        { en: 'Dashboard',                  ar: 'لوحة التحكم',               ku: 'داشبۆرد',                              tr: 'Panel' },
  dash_subtitle:     { en: 'AI-powered knowledge competition platform', ar: 'منصة مسابقات المعرفة المدعومة بالذكاء الاصطناعي', ku: 'پلاتفۆرمی پێشبڕکێی زانستی بە هۆشی دەستکرد', tr: 'Yapay zeka destekli bilgi yarışması platformu' },
  dash_experts:      { en: 'Total Experts',              ar: 'إجمالي الخبراء',            ku: 'کۆی پسپۆڕەکان',                       tr: 'Toplam Uzman' },
  dash_domains:      { en: 'Domains',                    ar: 'المجالات',                  ku: 'بواڕەکان',                             tr: 'Alanlar' },
  dash_active:       { en: 'Active Competitions',        ar: 'المسابقات النشطة',          ku: 'پێشبڕکێی چالاک',                      tr: 'Aktif Yarışmalar' },
  dash_submissions:  { en: 'Total Submissions',          ar: 'إجمالي الإجابات',           ku: 'کۆی وەڵامەکان',                       tr: 'Toplam Cevap' },
  dash_top_experts:  { en: 'Top Experts',                ar: 'أفضل الخبراء',              ku: 'باشترین پسپۆڕەکان',                   tr: 'En İyi Uzmanlar' },
  dash_recent:       { en: 'Recent Competitions',        ar: 'المسابقات الأخيرة',         ku: 'پێشبڕکێی دواتر',                      tr: 'Son Yarışmalar' },
  dash_how:          { en: 'How It Works',               ar: 'كيف يعمل',                  ku: 'چۆن کار دەکات',                       tr: 'Nasıl Çalışır' },

  // ── How it works steps ──────────────────────────────────────────────────
  step_ask:          { en: 'Ask',            ar: 'اسأل',            ku: 'بپرسە',           tr: 'Sor' },
  step_ask_desc:     { en: 'Submit your question or problem', ar: 'أرسل سؤالك أو مشكلتك', ku: 'پرسیار یان کێشەکەت بنێرە', tr: 'Sorunuzu veya probleminizi gönderin' },
  step_ai:           { en: 'AI Analysis',   ar: 'تحليل ذكاء اصطناعي', ku: 'شیکاری هۆشی دەستکرد', tr: 'YZ Analizi' },
  step_ai_desc:      { en: 'AI classifies and routes to experts', ar: 'الذكاء الاصطناعي يصنف ويوجه للخبراء', ku: 'هۆشی دەستکرد ڕێنووسی دەکات', tr: 'YZ sınıflandırır ve uzmanlara yönlendirir' },
  step_experts:      { en: 'Experts Answer',ar: 'يجيب الخبراء',    ku: 'پسپۆڕەکان وەڵام دەدەنەوە', tr: 'Uzmanlar Cevaplar' },
  step_experts_desc: { en: 'Top matched experts compete', ar: 'أفضل الخبراء يتنافسون', ku: 'باشترین پسپۆڕەکان پێشبڕکێ دەکەن', tr: 'En uygun uzmanlar yarışır' },
  step_eval:         { en: 'AI Evaluation', ar: 'تقييم الذكاء الاصطناعي', ku: 'هەڵسەنگاندنی هۆشی دەستکرد', tr: 'YZ Değerlendirmesi' },
  step_eval_desc:    { en: 'Accuracy, reasoning, completeness scored', ar: 'تقييم الدقة والمنطق والشمولية', ku: 'تەواوی و ڕاستی هەڵدەسەنگێندرێت', tr: 'Doğruluk, akıl yürütme, bütünlük puanlandı' },
  step_exam:         { en: 'Mini Exam',     ar: 'اختبار مصغر',     ku: 'تاقیکردنەوەی بچووک', tr: 'Mini Sınav' },
  step_exam_desc:    { en: 'Experts prove deep understanding', ar: 'الخبراء يثبتون فهمهم العميق', ku: 'پسپۆڕەکان تێگەیشتنی قووڵیان دەپشکنن', tr: 'Uzmanlar derin anlayışlarını kanıtlar' },
  step_rank:         { en: 'Ranking',       ar: 'التصنيف',         ku: 'ریزبەندی',        tr: 'Sıralama' },
  step_rank_desc:    { en: 'Best answer selected by AI + Exam + Rating', ar: 'أفضل إجابة تُختار بالذكاء الاصطناعي', ku: 'باشترین وەڵام هەڵدەبژێردرێت', tr: 'En iyi cevap YZ + Sınav + Puan ile seçildi' },
  step_reward:       { en: 'Win & Reward',  ar: 'الفوز والمكافأة', ku: 'برد و خەڵات',     tr: 'Kazan & Ödül' },
  step_reward_desc:  { en: 'Winner earns points redeemable for cash', ar: 'الفائز يكسب نقاطاً قابلة للصرف', ku: 'بەرنامی خاڵ وەردەگرێت', tr: 'Kazanan nakde çevrilebilir puan kazanır' },

  // ── Ask Question ────────────────────────────────────────────────────────
  ask_title:         { en: 'Ask a Question',       ar: 'اطرح سؤالاً',          ku: 'پرسیار بکە',                  tr: 'Soru Sor' },
  ask_subtitle:      { en: 'AI will classify your question and route it to best matching experts', ar: 'سيقوم الذكاء الاصطناعي بتصنيف سؤالك وتوجيهه للخبراء', ku: 'هۆشی دەستکرد پرسیارەکەت دابەشدەکات بۆ پسپۆڕەکان', tr: 'YZ sorunuzu sınıflandırır ve en uygun uzmanlara yönlendirir' },
  ask_label_title:   { en: 'Question Title *',     ar: 'عنوان السؤال *',       ku: 'سەردێڕی پرسیار *',            tr: 'Soru Başlığı *' },
  ask_placeholder_t: { en: 'e.g. How does quantum entanglement work?', ar: 'مثال: كيف يعمل التشابك الكمي؟', ku: 'نمونە: چۆن تێگەیشتن کار دەکات؟', tr: 'ör. Kuantum dolanıklığı nasıl çalışır?' },
  ask_label_desc:    { en: 'Detailed Description *', ar: 'الوصف التفصيلي *',   ku: 'وەسفی وردبینی *',             tr: 'Ayrıntılı Açıklama *' },
  ask_placeholder_d: { en: 'Provide as much context as possible...', ar: 'قدم أكبر قدر ممكن من السياق...', ku: 'زۆرترین زانیاری دابین بکە...', tr: 'Mümkün olduğunca bağlam sağlayın...' },
  ask_urgency:       { en: 'Urgency',              ar: 'الأولوية',             ku: 'گرنگی',                       tr: 'Aciliyet' },
  ask_low:           { en: 'Low',                  ar: 'منخفض',               ku: 'کەم',                         tr: 'Düşük' },
  ask_normal:        { en: 'Normal',               ar: 'عادي',                ku: 'ئاسایی',                      tr: 'Normal' },
  ask_high:          { en: 'High',                 ar: 'عالٍ',                ku: 'بەرز',                        tr: 'Yüksek' },
  ask_critical:      { en: 'Critical',             ar: 'حرج',                 ku: 'زۆر گرنگ',                   tr: 'Kritik' },
  ask_submit:        { en: '🚀 Submit & Start Competition', ar: '🚀 أرسل وابدأ المسابقة', ku: '🚀 بنێرە و پێشبڕکێ دەستپێبکە', tr: '🚀 Gönder & Yarışmayı Başlat' },
  ask_analyzing:     { en: 'AI Analyzing Your Question', ar: 'الذكاء الاصطناعي يحلل سؤالك', ku: 'هۆشی دەستکرد پرسیارەکەت شیدەکاتەوە', tr: 'YZ Sorunuzu Analiz Ediyor' },
  ask_analyzing_sub: { en: 'Detecting domain, routing to experts...', ar: 'تحديد المجال، توجيه الخبراء...', ku: 'دیاریکردنی بوار، ناردن بۆ پسپۆڕەکان...', tr: 'Alan tespit ediliyor, uzmanlara yönlendiriliyor...' },
  ask_done_title:    { en: 'AI Analysis Complete', ar: 'اكتمل تحليل الذكاء الاصطناعي', ku: 'شیکاری هۆشی دەستکرد تەواو بوو', tr: 'YZ Analizi Tamamlandı' },
  ask_another:       { en: 'Ask Another',          ar: 'اطرح سؤالاً آخر',     ku: 'پرسیاری تر بکە',              tr: 'Başka Soru Sor' },
  ask_comp_started:  { en: 'Competition Started!', ar: 'بدأت المسابقة!',      ku: 'پێشبڕکێ دەستپێکرد!',         tr: 'Yarışma Başladı!' },

  // ── Analysis Result ─────────────────────────────────────────────────────
  result_domain:     { en: 'Domain',       ar: 'المجال',     ku: 'بوار',       tr: 'Alan' },
  result_subdomain:  { en: 'Sub-Domain',   ar: 'المجال الفرعي', ku: 'بواری لاوەکی', tr: 'Alt Alan' },
  result_topic:      { en: 'Topic',        ar: 'الموضوع',    ku: 'بابەت',      tr: 'Konu' },
  result_qtype:      { en: 'Question Type',ar: 'نوع السؤال', ku: 'جۆری پرسیار', tr: 'Soru Tipi' },
  result_difficulty: { en: 'Difficulty',   ar: 'الصعوبة',    ku: 'قووڵی',      tr: 'Zorluk' },
  result_confidence: { en: 'Confidence',   ar: 'الثقة',      ku: 'متمانە',     tr: 'Güven' },
  result_reasoning:  { en: 'AI Reasoning', ar: 'تفكير الذكاء الاصطناعي', ku: 'ئازموونی هۆشی دەستکرد', tr: 'YZ Akıl Yürütmesi' },
  result_matched:    { en: 'Matched Experts', ar: 'الخبراء المتطابقون', ku: 'پسپۆڕە تاکتیکییەکان', tr: 'Eşleşen Uzmanlar' },
  result_similarity: { en: 'Similarity',   ar: 'التشابه',    ku: 'هاوشێوەیی',  tr: 'Benzerlik' },

  // ── Experts ─────────────────────────────────────────────────────────────
  exp_title:         { en: 'Expert Directory',    ar: 'دليل الخبراء',        ku: 'ڕووپێوی پسپۆڕەکان',    tr: 'Uzman Dizini' },
  exp_search:        { en: 'Search experts...',   ar: 'ابحث عن الخبراء...',  ku: 'گەڕان بۆ پسپۆڕ...',    tr: 'Uzman ara...' },
  exp_all_domains:   { en: 'All Domains',         ar: 'جميع المجالات',       ku: 'هەموو بواڕەکان',        tr: 'Tüm Alanlar' },
  exp_verified:      { en: 'Verified only',       ar: 'موثقون فقط',         ku: 'دڵنیاکراوەکان تەنها',   tr: 'Yalnızca Onaylı' },
  exp_experience:    { en: 'experience',          ar: 'خبرة',               ku: 'ئەزموون',              tr: 'deneyim' },
  exp_wins:          { en: 'wins',                ar: 'انتصارات',           ku: 'بردنەوە',              tr: 'kazanma' },
  exp_reviews:       { en: 'reviews',             ar: 'تقييمات',            ku: 'هەڵسەنگاندن',          tr: 'değerlendirme' },
  exp_available:     { en: 'Available',           ar: 'متاح',               ku: 'بەردەست',              tr: 'Müsait' },
  exp_busy:          { en: 'Busy',                ar: 'مشغول',              ku: 'بەکارهاتوو',           tr: 'Meşgul' },

  // ── Competitions ────────────────────────────────────────────────────────
  comp_title:        { en: 'Knowledge Competitions', ar: 'مسابقات المعرفة',   ku: 'پێشبڕکێی زانیاری',    tr: 'Bilgi Yarışmaları' },
  comp_all:          { en: 'All',                    ar: 'الكل',             ku: 'هەموو',               tr: 'Tümü' },
  comp_pending:      { en: 'Pending',                ar: 'قيد الانتظار',     ku: 'چاوەڕوانە',           tr: 'Beklemede' },
  comp_active:       { en: 'Active',                 ar: 'نشط',             ku: 'چالاک',               tr: 'Aktif' },
  comp_exam:         { en: 'Exam',                   ar: 'اختبار',           ku: 'تاقیکردنەوە',         tr: 'Sınav' },
  comp_done:         { en: 'Done',                   ar: 'مكتمل',           ku: 'تەواو',               tr: 'Tamamlandı' },
  comp_answers:      { en: 'answers',                ar: 'إجابات',          ku: 'وەڵام',               tr: 'cevap' },
  comp_points:       { en: 'points',                 ar: 'نقاط',            ku: 'خاڵ',                 tr: 'puan' },

  // ── Rewards ─────────────────────────────────────────────────────────────
  rew_title:         { en: 'Rewards & Points',      ar: 'المكافآت والنقاط',    ku: 'خەڵات و خاڵەکان',      tr: 'Ödüller & Puanlar' },
  rew_subtitle:      { en: 'Win competitions to earn points, watch ads, convert to money', ar: 'اربح مسابقات، شاهد إعلانات، حوّل إلى نقود', ku: 'پێشبڕکێ ببرە، خاڵ وەربگرە، بگۆڕە بۆ پارە', tr: 'Yarışmalarda kazan, puan biriktir, paraya çevir' },
  rew_total_pts:     { en: 'Total Points',           ar: 'إجمالي النقاط',       ku: 'کۆی خاڵەکان',          tr: 'Toplam Puan' },
  rew_money:         { en: 'Money Value',            ar: 'القيمة النقدية',      ku: 'بەهای پارەکە',         tr: 'Para Değeri' },
  rew_claimable:     { en: 'Claimable Rewards',      ar: 'المكافآت القابلة للمطالبة', ku: 'خەڵاتی وەرگرتنی', tr: 'Talep Edilebilir Ödüller' },
  rew_claim:         { en: 'Claim',                  ar: 'استلام',             ku: 'وەربگرە',             tr: 'Talep Et' },
  rew_claimed:       { en: 'Claimed',                ar: 'تم الاستلام',        ku: 'وەرگیرا',             tr: 'Talep Edildi' },
  rew_watch_ad:      { en: 'Watch a Short Ad',       ar: 'شاهد إعلاناً قصيراً', ku: 'ڕیکلامێکی کورت ببینە', tr: 'Kısa Reklam İzle' },
  rew_watch_claim:   { en: 'Watch & Claim Points',   ar: 'شاهد واستلم النقاط', ku: 'ببینە و خاڵ وەربگرە',  tr: 'İzle & Puan Kazan' },
  rew_rate:          { en: 'Conversion Rate: 1000 points = $1.00', ar: 'معدل التحويل: 1000 نقطة = 1 دولار', ku: 'ڕێژەی گۆڕین: 1000 خاڵ = 1 دۆلار', tr: 'Dönüşüm Oranı: 1000 puan = $1,00' },
  rew_min:           { en: 'Minimum withdrawal: 10,000 pts ($10)', ar: 'الحد الأدنى للسحب: 10,000 نقطة', ku: 'کەمترین ڕاکێشان: 10,000 خاڵ', tr: 'Minimum çekim: 10.000 puan ($10)' },
  rew_no_rewards:    { en: 'No rewards yet. Win competitions to earn points!', ar: 'لا توجد مكافآت بعد. اربح مسابقات!', ku: 'هێشتا خەڵات نییە. پێشبڕکێ ببرە!', tr: 'Henüz ödül yok. Yarışmalarda kazan!' },

  // ── Common ──────────────────────────────────────────────────────────────
  prev:              { en: 'Prev',    ar: 'السابق',  ku: 'پێشوو',  tr: 'Önceki' },
  next:              { en: 'Next',    ar: 'التالي',  ku: 'دواتر',  tr: 'Sonraki' },
  page:              { en: 'Page',    ar: 'صفحة',    ku: 'لاپەڕە', tr: 'Sayfa' },
  of:                { en: 'of',      ar: 'من',      ku: 'لە',     tr: '/' },
  loading:           { en: 'Loading...', ar: 'جارٍ التحميل...', ku: 'بارکردن...', tr: 'Yükleniyor...' },
  years:             { en: 'yrs',     ar: 'سنوات',  ku: 'ساڵ',    tr: 'yıl' },
  demo_user:         { en: 'Demo User', ar: 'مستخدم تجريبي', ku: 'بەکارهێنەری نموونە', tr: 'Demo Kullanıcı' },
  pts:               { en: 'pts',     ar: 'نقطة',   ku: 'خاڵ',    tr: 'puan' },
  safety_warning:    { en: '⚠️ Safety Warning', ar: '⚠️ تحذير أمان', ku: '⚠️ ئاگاداری ئایمەنی', tr: '⚠️ Güvenlik Uyarısı' },
} as const;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  return (T[key] as Record<Lang, string>)[lang] ?? (T[key] as Record<Lang, string>)['en'];
}
