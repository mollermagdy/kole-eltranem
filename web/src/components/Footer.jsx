import { ArrowUp, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../assets/logo.webp'
import calAll from '../assets/cal-all-hymns.webp'
import { contact, footerColumns } from '../data/content'
import { Calligraphy, Container } from './ui'
import SocialIcon from './SocialIcon'

export default function Footer() {
  const subscribe = (e) => {
    e.preventDefault()
    e.target.reset()
    toast.success('تمّ الاشتراك في النشرة', { description: 'ستصلك أحدث الترانيم الموثّقة شهريًا.' })
  }

  return (
    <footer>
      <div className="bg-night relative overflow-hidden text-white">
        <Calligraphy
          src={calAll}
          className="pointer-events-none absolute -bottom-16 -left-24 h-[260px] w-[780px] max-w-none text-white opacity-[0.04]"
        />

        {/* newsletter band */}
        <Container className="relative max-w-[1100px] border-b border-white/10 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold">ترنيمة جديدة كل شهر في بريدك</h3>
              <p className="mt-1 text-[15px] text-white/60">قصة، لحن، ومصدر موثّق — بلا إزعاج.</p>
            </div>
            <form
              onSubmit={subscribe}
              className="flex w-full max-w-md gap-2 rounded-full bg-white/[0.06] p-1.5 ring-1 ring-white/10 focus-within:ring-white/30"
            >
              <input
                required
                type="email"
                dir="ltr"
                placeholder="name@example.com"
                aria-label="البريد الإلكتروني"
                className="min-w-0 flex-1 bg-transparent px-4 text-end text-[15px] text-white placeholder:text-white/40 focus:outline-none"
              />
              <button className="text-navy h-10 shrink-0 rounded-full bg-white px-5 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-95">
                اشترك
              </button>
            </form>
          </div>
        </Container>

        <Container className="relative grid max-w-[1100px] gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="shadow-lift grid size-[88px] place-items-center rounded-2xl bg-white p-2">
              <img src={logo} alt="كل الترانيم" className="size-full object-contain" />
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-[30px] text-white/70">
              مشروع غير ربحي لتوثيق الترنيمة العربية وحفظ تراثها النصّي واللحني، وإتاحته للباحثين والخدّام والكنائس.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-white/70">
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="size-4" /> <span dir="ltr">{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Phone className="size-4" /> <span dir="ltr">{contact.phone}</span>
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              {contact.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.label}
                  className="hover:text-navy grid size-10 place-items-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  <SocialIcon id={s.id} className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="inline-block text-[15px] text-white/65 transition-all hover:-translate-x-1 hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Container>
      </div>
      <Container className="text-muted flex flex-col items-center justify-between gap-3 py-6 text-[13px] sm:flex-row">
        <span>© ٢٠٢٦ كل الترانيم — جميع الحقوق محفوظة.</span>
        <span>صُنع بمحبة لخدمة الكنيسة العربية.</span>
        <a href="#top" className="text-ink hover:text-navy inline-flex items-center gap-1 font-bold">
          <ArrowUp className="size-4" /> للأعلى
        </a>
      </Container>
    </footer>
  )
}
