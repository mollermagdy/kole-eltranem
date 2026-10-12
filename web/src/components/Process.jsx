import { motion } from 'framer-motion'
import clsx from 'clsx'
import { steps } from '../data/content'
import { Button, Container, Reveal, SectionHeading } from './ui'
import { toArabic } from '../lib/format'

export default function Process() {
  return (
    <section id="process" className="bg-white pt-8 pb-28">
      <Container className="max-w-[1100px]">
        <SectionHeading
          eyebrow="عن المشروع"
          title="أربع مراحل قبل أن تدخل الترنيمة الأرشيف"
          subtitle="لا نكتفي بنقل الكلمات — لكل ترنيمة رحلةُ تحقيقٍ قبل أن تُنشر."
        />

        <ol className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* connector line behind the step numbers */}
          <div className="from-rose/30 via-emerald/30 to-teal/30 absolute inset-x-[12%] top-[52px] hidden h-px bg-gradient-to-l lg:block" />
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-surface ring-line hover:shadow-card relative h-full rounded-[20px] p-6 ring-1 transition-shadow hover:bg-white"
              >
                <span
                  className={clsx(
                    'ring-surface grid size-[52px] place-items-center rounded-full text-lg font-extrabold text-white ring-[6px]',
                    s.color,
                  )}
                >
                  {toArabic(s.n)}
                </span>
                <h3 className="text-ink mt-5 text-lg font-extrabold">{s.title}</h3>
                <p className="text-muted mt-2 text-[15px] leading-[30px]">{s.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          <Button href="#">اقرأ المنهجية كاملة</Button>
          <Button href="#doors" variant="outline">
            تصفّح الأقسام
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
