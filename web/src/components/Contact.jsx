import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import { contact } from '../data/content'
import { Container, Reveal, SectionHeading } from './ui'
import SocialIcon from './SocialIcon'

const field =
  'w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink ring-1 ring-line transition-all placeholder:text-muted/70 focus:bg-white focus:ring-2 focus:ring-lyrics/40 focus:outline-none'

const details = [
  { icon: Mail, label: 'البريد الإلكتروني', value: contact.email, href: `mailto:${contact.email}`, ltr: true },
  { icon: Phone, label: 'الهاتف', value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, ltr: true },
  { icon: MapPin, label: 'العنوان', value: contact.address },
]

export default function Contact() {
  const [sending, setSending] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    // No backend yet — simulate a request.
    setTimeout(() => {
      setSending(false)
      e.target.reset()
      toast.success('وصلتنا رسالتك، شكرًا لك!', { description: 'سنعود إليك خلال أيام قليلة.' })
    }, 900)
  }

  return (
    <section id="contact" className="scroll-mt-16 bg-white py-20 sm:py-28">
      <Container className="max-w-[1100px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div>
            <SectionHeading
              align="start"
              eyebrow="ساهم معنا"
              title="عندك ترنيمة أو قصة أو تسجيل نادر؟"
              subtitle="الأرشيف يكبر بمساهماتكم. أرسل لنا نصًّا، مصدرًا، تصحيحًا أو تسجيلًا قديمًا، وسيمرّ بمراحل التحقيق الأربع قبل النشر."
            />

            <Reveal delay={0.1} as="ul" className="mt-8 space-y-3">
              {details.map(({ icon: Icon, label, value, href, ltr }) => {
                const Tag = href ? 'a' : 'div'
                return (
                  <li key={label}>
                    <Tag
                      href={href}
                      className="group ring-line hover:bg-surface hover:ring-lyrics/30 flex items-center gap-4 rounded-2xl p-3 ring-1 transition-all"
                    >
                      <span className="bg-lyrics/10 text-lyrics group-hover:bg-lyrics grid size-11 shrink-0 place-items-center rounded-xl transition-colors group-hover:text-white">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="text-muted block text-[12px] font-bold">{label}</span>
                        <span className="text-ink block text-[15px] font-bold" dir={ltr ? 'ltr' : undefined}>
                          {value}
                        </span>
                      </span>
                    </Tag>
                  </li>
                )
              })}
            </Reveal>

            <Reveal delay={0.15} className="mt-6 flex gap-2">
              {contact.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.label}
                  className="text-muted ring-line hover:bg-navy hover:ring-navy grid size-11 place-items-center rounded-full ring-1 transition-all hover:-translate-y-0.5 hover:text-white"
                >
                  <SocialIcon id={s.id} className="size-[18px]" />
                </a>
              ))}
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="shadow-lift ring-line rounded-[28px] bg-white p-5 ring-1 sm:p-8">

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-ink mb-1.5 block text-[13px] font-bold">الاسم</span>
                  <input required name="name" className={field} placeholder="اسمك الكامل" />
                </label>
                <label className="block">
                  <span className="text-ink mb-1.5 block text-[13px] font-bold">البريد الإلكتروني</span>
                  <input
                    required
                    type="email"
                    name="email"
                    dir="ltr"
                    className={clsx(field, 'text-end')}
                    placeholder="name@example.com"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-ink mb-1.5 block text-[13px] font-bold">اسم الترنيمة (اختياري)</span>
                  <input name="hymn" className={field} placeholder="مثال: يا كلَّ الأرضِ اهتفي" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-ink mb-1.5 block text-[13px] font-bold">رسالتك</span>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className={clsx(field, 'resize-none')}
                    placeholder="اكتب ما تودّ مشاركته…"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-navy mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition-all hover:bg-[#151d4d] active:scale-[0.98] disabled:opacity-70 sm:w-auto sm:px-8"
              >
                {sending ? 'جارٍ الإرسال…' : 'أرسل المساهمة'}
                <Send className={clsx('size-4 -scale-x-100 transition-transform', sending && '-translate-x-1')} />
              </button>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
