import { ArrowUpLeft, Check } from 'lucide-react'
import clsx from 'clsx'
import calAll from '../assets/cal-all-hymns.webp'
import { doors, stats } from '../data/content'
import { Calligraphy, Container, CountUp, Pill, Reveal, SectionHeading } from './ui'
import { toArabic } from '../lib/format'
import TiltCard from './TiltCard'

function DoorCard({ door, i }) {
  return (
    <Reveal delay={i * 0.1}>
      <TiltCard
        as="a"
        href="#showcase"
        className={clsx(
          'shadow-card hover:shadow-lift flex h-[240px] flex-col justify-between overflow-hidden rounded-[22px] p-6 transition-shadow duration-300 sm:h-[250px]',
          door.bg,
          door.ink,
        )}
      >
        {/* faint repeated calligraphy watermark */}
        <Calligraphy
          src={door.calligraphy}
          className="pointer-events-none absolute -top-3 -left-6 h-[110px] w-[260px] opacity-[0.12] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
        />

        <div className="relative flex items-start justify-between">
          <Pill>
            {toArabic(door.count)} {door.unit}
          </Pill>
          <span className="grid size-9 place-items-center rounded-full transition-all duration-300 group-hover:bg-white/20">
            <ArrowUpLeft className="size-5 opacity-50 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </span>
        </div>

        <div className="relative">
          <Calligraphy
            src={door.calligraphy}
            label={door.title}
            className="h-[72px] w-[160px] [mask-position:right] transition-transform duration-500 group-hover:-translate-y-1"
          />
          {/* description swaps to the feature list on hover */}
          <div className="relative mt-3 h-12 overflow-hidden">
            <p className="text-[15px] leading-6 opacity-90 transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0">
              {door.description}
            </p>
            <ul className="absolute inset-0 flex translate-y-full flex-wrap content-start gap-x-3 gap-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {door.features.map((f) => (
                <li key={f} className="flex items-center gap-1 text-[14px] font-bold">
                  <Check className="size-3.5" strokeWidth={3} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TiltCard>
    </Reveal>
  )
}

export default function Doors() {
  return (
    <>
      <section id="doors" className="relative scroll-mt-20 pt-4">
        <Container>
          <SectionHeading
            title="ستة أبواب لكل ترنيمة"
            subtitle="لا نحفظ الكلمات وحدها — بل كل ما يحيط بالترنيمة من نصٍّ ولحنٍ وقصةٍ وإصداراتٍ ومصادر."
          />
          <div className="relative z-10 mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doors.map((d, i) => (
              <div key={d.id} className={clsx(i === 2 && 'sm:col-span-2 lg:col-span-1')}>
                <DoorCard door={d} i={i} />
              </div>
            ))}
          </div>
        </Container>
        {/* dark band the cards sit on top of */}
        <div className="bg-night absolute inset-x-0 bottom-0 h-[110px]" />
      </section>

      <section id="about" className="bg-night relative overflow-hidden pt-12 pb-16">
        <Calligraphy
          src={calAll}
          className="pointer-events-none absolute top-1/2 left-1/2 h-[309px] w-[932px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.05]"
        />
        <Container className="relative">
          <Reveal className="mx-auto grid max-w-[880px] grid-cols-2 gap-y-8 rounded-[22px] bg-white/[0.04] px-4 py-8 ring-1 ring-white/10 backdrop-blur-sm md:grid-cols-4 md:px-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={clsx(
                  'group text-center transition-transform duration-300 hover:-translate-y-1',
                  i > 0 && 'md:border-s md:border-white/10',
                )}
              >
                <CountUp
                  value={s.value}
                  className="group-hover:text-melody block text-[36px] leading-none font-extrabold text-white transition-colors sm:text-5xl"
                />
                <span className="mt-3 block text-sm font-medium text-white/60">{s.label}</span>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  )
}
