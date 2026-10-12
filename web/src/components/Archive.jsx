import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpenText, Music2, ScrollText, Volume2, X } from 'lucide-react'
import clsx from 'clsx'
import { archiveGroups, hymns } from '../data/content'
import { toArabic } from '../lib/format'
import { Container, Reveal, SectionHeading } from './ui'

const tones = {
  rose: { title: 'text-rose', chip: 'bg-rose/10 text-rose hover:bg-rose/15', on: 'bg-rose text-white' },
  emerald: {
    title: 'text-emerald',
    chip: 'bg-emerald/10 text-emerald hover:bg-emerald/15',
    on: 'bg-emerald text-white',
  },
  violet: { title: 'text-violet', chip: 'bg-violet/10 text-violet hover:bg-violet/15', on: 'bg-violet text-white' },
}

const ERA_RANGES = {
  'ما قبل ١٩٠٠': [0, 1900],
  '١٩٠٠–١٩٤٠': [1900, 1940],
  '١٩٤٠–١٩٧٠': [1940, 1970],
  '١٩٧٠–٢٠٠٠': [1970, 2000],
  'بعد ٢٠٠٠': [2000, 9999],
}

const matchers = {
  occasion: (h, v) => h.occasion === v,
  maqam: (h, v) => h.maqam === v,
  era: (h, v) => h.year >= ERA_RANGES[v][0] && h.year < ERA_RANGES[v][1],
}

const HAS = {
  text: [BookOpenText, 'النص'],
  melody: [Music2, 'اللحن'],
  story: [ScrollText, 'القصة'],
  audio: [Volume2, 'تسجيل'],
}

function HymnCard({ hymn }) {
  return (
    <motion.a
      layout
      href={`#${hymn.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group ring-line hover:shadow-lift flex flex-col rounded-2xl bg-white p-5 ring-1 transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-naskh text-ink group-hover:text-lyrics truncate text-xl leading-9 font-bold transition-colors">
            {hymn.title}
          </h4>
          {hymn.original && (
            <p className="text-muted/80 truncate text-[12px]" dir="ltr">
              {hymn.original}
            </p>
          )}
        </div>
        <span className="bg-emerald/10 text-emerald shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold">
          {hymn.maqam}
        </span>
      </div>
      <p className="text-muted mt-3 text-[13px]">
        <span className="text-ink font-bold">{hymn.writer}</span> · {hymn.composer} · {toArabic(hymn.year)}
      </p>
      <div className="border-line mt-4 flex items-center justify-between border-t pt-3">
        <span className="flex gap-1.5">
          {hymn.has.map((k) => {
            const [Icon, label] = HAS[k]
            return (
              <span key={k} title={label} className="bg-surface text-muted grid size-7 place-items-center rounded-full">
                <Icon className="size-3.5" />
              </span>
            )
          })}
        </span>
        <span className="bg-rose/10 text-rose rounded-full px-2.5 py-0.5 text-[12px] font-bold">{hymn.occasion}</span>
      </div>
    </motion.a>
  )
}

export default function Archive() {
  const [selected, setSelected] = useState([])
  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]))

  // AND between groups, OR within a group
  const results = useMemo(() => {
    const byGroup = {}
    for (const key of selected) {
      const [g, v] = key.split(':')
      ;(byGroup[g] ||= []).push(v)
    }
    return hymns.filter((h) => Object.entries(byGroup).every(([g, vals]) => vals.some((v) => matchers[g](h, v))))
  }, [selected])

  const count = (gid, item) => hymns.filter((h) => matchers[gid](h, item)).length

  return (
    <section id="archive" className="border-line bg-surface scroll-mt-16 border-y py-20">
      <Container className="max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            align="start"
            title="تصفّح الأرشيف"
            subtitle="ادخل من أي باب — المناسبة، المقام، أو الحقبة الزمنية."
          />
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelected([])}
                className="text-muted ring-line hover:text-ink flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold ring-1"
              >
                <X className="size-4" /> مسح التصفية ({toArabic(selected.length)})
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {archiveGroups.map((g, gi) => (
            <Reveal key={g.id} delay={gi * 0.08}>
              <h3 className={clsx('text-sm font-bold', tones[g.tone].title)}>{g.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => {
                  const key = `${g.id}:${item}`
                  const on = selected.includes(key)
                  const n = count(g.id, item)
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggle(key)}
                      aria-pressed={on}
                      className={clsx(
                        'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
                        on ? tones[g.tone].on : tones[g.tone].chip,
                      )}
                    >
                      {item}
                      {n > 0 && (
                        <span className={clsx('text-[11px]', on ? 'opacity-80' : 'opacity-60')}>{toArabic(n)}</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </Reveal>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="mt-12">
            <p className="text-muted mb-4 text-sm font-bold">{toArabic(results.length)} ترنيمة مطابقة</p>
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((h) => (
                  <HymnCard key={h.id} hymn={h} />
                ))}
              </AnimatePresence>
            </motion.div>
            {selected.length > 0 && results.length === 0 && (
              <div className="border-line rounded-2xl border border-dashed bg-white px-6 py-10 text-center">
                <p className="text-ink font-bold">لا توجد ترانيم بهذه التصفية بعد</p>
                <p className="text-muted mt-1 text-sm">
                  هل تعرف واحدة؟{' '}
                  <a href="#contact" className="text-lyrics font-bold hover:underline">
                    ساعدنا بإضافتها
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}
