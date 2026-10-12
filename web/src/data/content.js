// All copy for the home page lives here so sections stay presentational.
// Numbers are stored as plain integers and formatted with Arabic-Indic digits at render time.

import calStory from '../assets/cal-story.webp'
import calMelody from '../assets/cal-melody.webp'
import calLyrics from '../assets/cal-lyrics.webp'

export const nav = [
  { label: 'الرئيسية', href: '#top' },
  { label: 'الأقسام', href: '#doors' },
  { label: 'السجلّ', href: '#showcase' },
  { label: 'عن المشروع', href: '#process' },
  { label: 'الأرشيف', href: '#archive' },
  { label: 'تواصل', href: '#contact' },
]

export const heroTags = [
  // upper pair sits wider, lower pair tucks in closer to the logo
  {
    label: 'قصة الترنيمة',
    className: 'bg-story-soft text-white',
    pos: 'top-[8%] left-0 sm:top-[16%] sm:left-[4%] lg:left-[8%] rotate-[4deg]',
  },
  {
    label: 'البحث كتابي',
    className: 'bg-melody text-ink',
    pos: 'top-[50%] left-[3%] sm:top-[45%] sm:left-[13%] lg:left-[17%] -rotate-[3deg]',
  },
  {
    label: 'النص والكلمات',
    className: 'bg-lyrics-sky text-white',
    pos: 'top-[10%] right-0 sm:top-[17%] sm:right-[4%] lg:right-[8%] -rotate-[4deg]',
  },
  {
    label: 'اللحن والموسيقى',
    className: 'bg-mint text-ink',
    pos: 'top-[52%] right-[3%] sm:top-[46%] sm:right-[12%] lg:right-[16%] rotate-[5deg]',
  },
]

export const searchModes = ['بحث عام', 'بحث موضوعي', 'بحث كتابي']

export const searchScopes = [
  { id: 'all', label: 'الكل' },
  { id: 'title', label: 'العنوان' },
  { id: 'writer', label: 'الكاتب' },
  { id: 'composer', label: 'الملحّن' },
  { id: 'maqam', label: 'المقام' },
  { id: 'occasion', label: 'المناسبة' },
]

export const popularSearches = ['الميلاد', 'نهاوند', 'نعمة عجيبة', 'القيامة', 'جون نيوتن']

/**
 * Sample records. The translated classics carry their real, documented origins;
 * the first record is the one shown in the Figma design.
 */
export const hymns = [
  {
    id: 'ya-kol-alard',
    title: 'يا كلَّ الأرضِ اهتفي',
    firstLine: 'يا كلَّ الأرضِ اهتفي للربِّ بترنيمْ',
    writer: 'إلياس فرح',
    composer: 'منير رفلة',
    maqam: 'نهاوند',
    year: 1968,
    occasion: 'التسبيح',
    has: ['text', 'melody', 'story', 'audio'],
  },
  {
    id: 'amazing-grace',
    title: 'نعمة عجيبة',
    original: 'Amazing Grace',
    writer: 'جون نيوتن',
    composer: 'لحن أمريكي شعبي',
    maqam: 'عجم',
    year: 1779,
    occasion: 'العبادة',
    story: 'كتبها قبطان سابق لسفينة رقيق بعد تحوّله، فصارت شهادة شخصية عن النعمة والغفران.',
    has: ['text', 'melody', 'story', 'audio'],
  },
  {
    id: 'silent-night',
    title: 'ليلة الميلاد الساكنة',
    original: 'Stille Nacht',
    writer: 'يوسف مور',
    composer: 'فرانز غروبر',
    maqam: 'عجم',
    year: 1818,
    occasion: 'الميلاد',
    story: 'رُنِّمت أول مرة ليلة الميلاد في كنيسة صغيرة بقرية أوبرندورف النمساوية على أنغام الغيتار.',
    has: ['text', 'melody', 'story'],
  },
  {
    id: 'how-great',
    title: 'ما أعظمك',
    original: 'O Store Gud',
    writer: 'كارل بوبرغ',
    composer: 'لحن سويدي شعبي',
    maqam: 'عجم',
    year: 1885,
    occasion: 'التسبيح',
    story: 'كتبها شاعر سويدي شابّ بعد أن شهد عاصفة رعدية تعقبها سكينة وتغريد طيور.',
    has: ['text', 'melody', 'story', 'audio'],
  },
  {
    id: 'holy-holy',
    title: 'قدوسٌ قدوسٌ قدوس',
    original: 'Holy, Holy, Holy',
    writer: 'ريجنالد هيبر',
    composer: 'جون دايكس',
    maqam: 'عجم',
    year: 1826,
    occasion: 'العبادة',
    has: ['text', 'melody'],
  },
  {
    id: 'rock-of-ages',
    title: 'يا صخرَ الدهور',
    original: 'Rock of Ages',
    writer: 'أوغسطس توبلادي',
    composer: 'توماس هاستينغز',
    maqam: 'نهاوند',
    year: 1763,
    occasion: 'الصوم',
    has: ['text', 'melody', 'story'],
  },
  {
    id: 'nearer-my-god',
    title: 'أقرب إليك يا إلهي',
    original: 'Nearer, My God, to Thee',
    writer: 'سارة فلاور آدمز',
    composer: 'لويل ماسون',
    maqam: 'نهاوند',
    year: 1841,
    occasion: 'العبادة',
    has: ['text', 'melody', 'audio'],
  },
  {
    id: 'christ-risen',
    title: 'المسيحُ قامَ اليوم',
    original: 'Christ the Lord Is Risen Today',
    writer: 'تشارلز وسلي',
    composer: 'لحن من القرن الثامن عشر',
    maqam: 'عجم',
    year: 1739,
    occasion: 'القيامة',
    has: ['text', 'melody'],
  },
]

export const doors = [
  {
    id: 'lyrics',
    title: 'النص والكلمات',
    calligraphy: calLyrics,
    count: 4820,
    unit: 'نصًا',
    description: 'الكلمات الكاملة، الروايات المختلفة، والتحقيق اللغوي.',
    features: ['النص المحقَّق', 'الروايات المختلفة', 'الشواهد الكتابية'],
    bg: 'bg-lyrics',
    ink: 'text-white',
  },
  {
    id: 'melody',
    title: 'اللحن والموسيقى',
    calligraphy: calMelody,
    count: 3140,
    unit: 'لحنًا',
    description: 'المقام، النوتة، التوزيع، ومصادر اللحن وأصوله.',
    features: ['النوتة الموسيقية', 'المقام والإيقاع', 'التسجيلات'],
    bg: 'bg-melody',
    ink: 'text-ink',
  },
  {
    id: 'story',
    title: 'قصة الترنيمة',
    calligraphy: calStory,
    count: 1260,
    unit: 'قصة',
    description: 'مناسبة الكتابة، سيرة الكاتب، والحكاية وراء كل ترنيمة.',
    features: ['مناسبة الكتابة', 'سيرة الكاتب', 'الوثائق والصور'],
    bg: 'bg-story',
    ink: 'text-white',
  },
]

export const stats = [
  { value: 4820, label: 'ترنيمة' },
  { value: 9740, label: 'إصدارًا' },
  { value: 1260, label: 'قصة' },
  { value: 630, label: 'كاتبًا وملحّنًا' },
]

export const featuredHymn = {
  title: 'يا كلَّ الأرضِ اهتفي',
  lines: ['يا كلَّ الأرضِ اهتفي للربِّ بترنيمْ', 'ادخلوا أبوابَهُ بالحمدِ ودِيارَهُ بالتسبيحْ'],
  meta: [
    { label: 'الكاتب', value: 'إلياس فرح' },
    { label: 'الملحّن', value: 'منير رفلة' },
    { label: 'المقام', value: 'نهاوند' },
    { label: 'سنة الكتابة', value: '١٩٦٨' },
  ],
}

export const steps = [
  { n: 1, title: 'الجمع', body: 'نرصد كل صيغة للترنيمة في مصادرها.', color: 'bg-rose' },
  { n: 2, title: 'المقابلة', body: 'نقابل الروايات ونثبت الأوثق دون حذف.', color: 'bg-violet' },
  { n: 3, title: 'التحقيق', body: 'نراجع النصّ لغويًّا واللحن موسيقيًّا.', color: 'bg-emerald' },
  { n: 4, title: 'النشر', body: 'ننشر السجلّ كاملًا بمصادره، مفتوحًا.', color: 'bg-teal' },
]

export const archiveGroups = [
  {
    id: 'occasion',
    title: 'حسب المناسبة',
    tone: 'rose',
    items: ['الميلاد', 'الصوم', 'القيامة', 'الخمسين', 'العبادة', 'التسبيح', 'الدعوة', 'العشاء الرباني'],
  },
  {
    id: 'maqam',
    title: 'حسب المقام',
    tone: 'emerald',
    items: ['نهاوند', 'كرد', 'راست', 'بياتي', 'حجاز', 'صبا', 'عجم'],
  },
  {
    id: 'era',
    title: 'حسب الحقبة',
    tone: 'violet',
    items: ['ما قبل ١٩٠٠', '١٩٠٠–١٩٤٠', '١٩٤٠–١٩٧٠', '١٩٧٠–٢٠٠٠', 'بعد ٢٠٠٠'],
  },
]

// Placeholder contact details — replace with the project's real ones.
export const contact = {
  email: 'hello@kol-altaranim.org',
  phone: '+961 1 000 000',
  address: 'بيروت، لبنان',
  socials: [
    { id: 'youtube', label: 'يوتيوب', href: '#' },
    { id: 'facebook', label: 'فيسبوك', href: '#' },
    { id: 'instagram', label: 'إنستغرام', href: '#' },
    { id: 'whatsapp', label: 'واتساب', href: '#' },
  ],
}

export const footerColumns = [
  { title: 'الأقسام', links: ['النص والكلمات', 'اللحن والموسيقى', 'قصة الترنيمة', 'الإصدارات'] },
  { title: 'البحث', links: ['البحث الكتابي', 'البحث الموضوعي', 'مصادر أخرى', 'تصفّح الأرشيف'] },
  { title: 'المشروع', links: ['من نحن', 'عن المشروع', 'المنهجية والتوثيق', 'ساهم معنا'] },
]
