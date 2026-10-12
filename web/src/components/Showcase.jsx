import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, ScrollText } from 'lucide-react'
import clsx from 'clsx'
import logo from '../assets/logo.webp'
import calStory from '../assets/cal-story.webp'
import calMelody from '../assets/cal-melody.webp'
import sheet from '../assets/sheet-music.webp'
import { featuredHymn, hymns } from '../data/content'
import { toArabic } from '../lib/format'
import { Button, Calligraphy, Container, Pill, Reveal, SectionHeading } from './ui'

const storyHymns = ['how-great', 'amazing-grace', 'silent-night'].map((id) => hymns.find((h) => h.id === id))

const metaOf = (h) => [
  { label: 'الكاتب', value: h.writer },
  { label: 'الملحّن', value: h.composer },
  { label: 'المقام', value: h.maqam },
  { label: 'سنة الكتابة', value: toArabic(h.year) },
]

function MetaRow({ meta, className, size = 'md' }) {
  return (
    <dl className={clsx('grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4', className)}>
      {meta.map((m) => (
        <div key={m.label} className="min-w-0">
          <dt className="text-muted text-[11px] font-bold sm:text-[12px]">{m.label}</dt>
          <dd className={clsx('text-ink mt-0.5 truncate font-bold', size === 'md' ? 'text-[15px]' : 'text-[14px]')}>
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Faint circular logo used as a background watermark on the showcase cards. */
function LogoWatermark({ className }) {
  return <Calligraphy src={logo} className={clsx('pointer-events-none absolute aspect-square', className)} />
}

function FeaturedRecord() {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="relative mx-auto w-full max-w-[500px] pt-3 lg:mx-0">
      {/* paper stacked behind */}
      <div className="bg-paper absolute inset-x-5 top-0 h-10 rounded-t-[20px] transition-transform duration-500 group-hover/feat:-translate-y-2" />
      <motion.article
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="shadow-lift relative rounded-t-[20px] bg-white px-6 pt-7 pb-6 sm:px-8 sm:pt-8"
      >
        <h3 className="font-naskh text-ink text-[28px] leading-[1.5] font-bold sm:text-[38px]">{featuredHymn.title}</h3>
        <div className="font-naskh text-ink/75 mt-2 text-[15px] leading-[34px] sm:text-[17px]">
          {featuredHymn.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <MetaRow meta={featuredHymn.meta} className="border-line mt-5 border-t pt-4" />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button href="#">افتح السجلّ الكامل</Button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="text-ink ring-line hover:bg-surface inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold ring-1 transition-all active:scale-95"
          >
            {playing ? (
              <Pause className="size-3.5" fill="currentColor" />
            ) : (
              <Play className="size-3.5" fill="currentColor" />
            )}
            {playing ? 'إيقاف' : 'استمع'}
          </button>
          {/* tiny fake equaliser while "playing" */}
          <AnimatePresence>
            {playing && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-5 items-end gap-0.5"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="bg-lyrics w-1 rounded-full"
                    animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    </div>
  )
}

function StoryCard({ hymn, className, featured }) {
  return (
    <article className={clsx('shadow-card rounded-[18px] py-4 pr-5 pl-14 transition-all duration-500 sm:pr-6 sm:pl-16', className)}>
      <h4 className="font-naskh text-ink text-[21px] leading-[42px] font-bold sm:text-[24px]">{hymn.title}</h4>
      <MetaRow meta={metaOf(hymn)} size="sm" className="mt-1" />
      {featured && hymn.story && (
        <p className="border-line text-muted mt-3 flex gap-2 border-t pt-3 text-[13px] leading-6">
          <ScrollText className="text-story mt-0.5 size-4 shrink-0" />
          {hymn.story}
        </p>
      )}
    </article>
  )
}

function StoryPanel() {
  const [a, b, c] = storyHymns
  return (
    <div
      id="story"
      className="group bg-story relative flex h-full min-h-[620px] scroll-mt-28 flex-col overflow-hidden rounded-[28px] p-6 sm:min-h-[520px] sm:p-8"
    >
      <LogoWatermark className="-top-16 -right-16 w-[340px] text-white opacity-[0.08]" />
      <div className="relative z-10 flex justify-start">
        <Pill>١٢٦٠ قصة</Pill>
      </div>

      {/* stack bleeds off the card's left edge; fans out on hover */}
      <div className="relative z-10 mt-6 -ml-6 h-[380px] sm:-ml-8 sm:h-[300px]">
        <StoryCard hymn={a} className="bg-paper absolute top-0 -left-8 w-[88%] group-hover:-translate-y-2 sm:w-[62%]" />
        <StoryCard
          hymn={c}
          className="bg-paper absolute top-[150px] -left-8 w-[84%] group-hover:translate-y-3 sm:top-[170px] sm:w-[58%]"
        />
        <StoryCard
          hymn={b}
          featured
          className="shadow-lift absolute top-[70px] -left-8 z-10 w-[96%] bg-white group-hover:-translate-x-2 sm:top-[80px] sm:w-[70%]"
        />
      </div>

      <div className="relative z-10 mt-auto pt-6 text-white">
        <Calligraphy src={calStory} label="قصة الترنيمة" className="h-[60px] w-[150px] [mask-position:right]" />
        <p className="mt-2 text-[15px] text-white/90">مناسبة الكتابة، سيرة الكاتب، والحكاية وراء كل ترنيمة.</p>
      </div>
    </div>
  )
}

function MelodyPanel() {
  return (
    <div
      id="melody"
      className="group bg-melody relative flex h-full min-h-[480px] scroll-mt-28 flex-col overflow-hidden rounded-[28px] p-6 sm:min-h-[520px] sm:p-8"
    >
      <LogoWatermark className="text-ink -right-20 bottom-24 w-[320px] opacity-[0.06]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <Pill className="shrink-0">٣١٤٠ لحنًا</Pill>
        {/* sheet card hangs from the top edge */}
        <div className="relative -mt-14 w-[72%] max-w-[300px] sm:-mt-16">
          <div className="bg-paper absolute inset-x-3 -bottom-2.5 h-full rounded-b-[18px]" />
          <div className="shadow-lift relative overflow-hidden rounded-b-[18px] bg-white px-3 pt-12 pb-3 transition-transform duration-500 group-hover:-translate-y-1.5">
            <div className="relative overflow-hidden">
              <img
                src={sheet}
                alt="نوتة موسيقية"
                className="h-[150px] w-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:-translate-y-6"
              />
              <span className="absolute inset-0 grid place-items-center bg-white/0 transition-colors group-hover:bg-white/40">
                <span className="bg-navy shadow-lift grid size-12 scale-75 place-items-center rounded-full text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <Play className="size-5 translate-x-[-1px]" fill="currentColor" />
                </span>
              </span>
            </div>
            <p className="font-naskh text-ink pt-3 text-[20px] font-bold sm:text-[22px]">يا كلَّ الأرضِ اهتفي</p>
            <p className="text-muted text-[12px] font-bold">مقام نهاوند · ٤/٤</p>
          </div>
        </div>
      </div>

      <div className="text-ink relative z-10 mt-auto pt-8">
        <Calligraphy src={calMelody} label="اللحن والموسيقى" className="h-[60px] w-[150px] [mask-position:right]" />
        <p className="text-ink/80 mt-2 text-[15px]">المقام، النوتة، التوزيع، ومصادر اللحن وأصوله.</p>
      </div>
    </div>
  )
}

export default function Showcase() {
  return (
    <section id="showcase" className="scroll-mt-16 bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading title="ستة أبوابٍ لكل ترنيمة" />

        {/* Lyrics: the featured record */}
        <Reveal className="mt-10 sm:mt-12">
          <div
            id="lyrics"
            className="group/feat from-lyrics-sky relative grid scroll-mt-28 items-end overflow-hidden rounded-[28px] bg-gradient-to-l to-[#4b72e3] px-5 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-2 lg:gap-10"
          >
            <LogoWatermark className="-top-20 -right-24 w-[460px] text-white opacity-[0.07] lg:top-auto lg:right-auto lg:-bottom-28 lg:left-[46%]" />
            <div className="relative flex flex-col self-stretch pb-8 text-white lg:pb-10">
              <h3 className="text-[26px] font-bold sm:text-[34px]">سجلٌّ واحد، ستة أبواب</h3>
              <p className="mt-2 text-[15px] text-white/80">هكذا يبدو أثرُ ترنيمةٍ واحدة في الأرشيف.</p>
              <div className="mt-6 flex flex-wrap gap-2 lg:mt-8">
                {['النص', 'اللحن', 'القصة', 'الإصدارات', 'المصادر', 'التسجيلات'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-bold ring-1 ring-white/20 backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href="#archive"
                className="group/link mt-6 inline-flex w-fit items-center gap-1 text-sm font-bold text-white/90 hover:text-white lg:mt-auto lg:self-end"
              >
                تصفّح كل الترانيم
                <span className="transition-transform group-hover/link:-translate-x-1">←</span>
              </a>
            </div>
            <FeaturedRecord />
          </div>
        </Reveal>

        {/* RTL: first child sits on the right */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.7fr]">
          <Reveal>
            <MelodyPanel />
          </Reveal>
          <Reveal delay={0.1}>
            <StoryPanel />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
