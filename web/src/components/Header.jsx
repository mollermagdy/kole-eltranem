import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { HeartHandshake, Menu, Search, X } from 'lucide-react'
import clsx from 'clsx'
import logo from '../assets/logo.webp'
import { nav } from '../data/content'
import { Container } from './ui'

export function Brand({ compact = false, light = false }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5" aria-label="كل الترانيم — الرئيسية">
      <img
        src={logo}
        alt=""
        className={clsx(
          'object-contain transition-transform duration-500 group-hover:-rotate-6',
          compact ? 'size-12' : 'size-16',
        )}
      />
      <span className={clsx('text-[12px] leading-[15px] font-bold', light ? 'text-white/80' : 'text-rose')}>
        أصـل وفصـل
        <br />
        كـــل ترنيمــــــــة
      </span>
    </a>
  )
}

/** Active section = the last one whose top has passed 40% of the viewport. */
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    let frame
    const update = () => {
      frame = null
      const line = window.innerHeight * 0.4
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // bottom of the page: always highlight the last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids.at(-1)
      setActive(current)
    }
    const onScroll = () => (frame ??= requestAnimationFrame(update))
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids])
  return active
}

const ids = nav.map((n) => n.href.slice(1))

const focusSearch = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const active = useScrollSpy(ids)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 transition-[background,box-shadow] duration-300',
        scrolled
          ? 'bg-white/80 shadow-[0_1px_0_rgb(26_19_32/0.06)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent',
      )}
    >
      <Container
        className={clsx(
          'flex items-center justify-between gap-4 transition-[height] duration-300',
          scrolled ? 'h-16' : 'h-[76px]',
        )}
      >
        <Brand compact />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="التنقل الرئيسي"
          onMouseLeave={() => setHovered(null)}
        >
          {nav.map((item) => {
            const id = item.href.slice(1)
            const on = active === id
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={on ? 'true' : undefined}
                onMouseEnter={() => setHovered(id)}
                onFocus={() => setHovered(id)}
                className={clsx(
                  'relative rounded-full px-4 py-2 text-[15px] font-bold transition-colors duration-200',
                  on ? 'text-navy' : hovered === id ? 'text-ink' : 'text-muted',
                )}
              >
                {/* hover highlight glides between items */}
                {hovered === id && !on && (
                  <motion.span
                    layoutId="nav-hover"
                    className="bg-ink/[0.045] absolute inset-0 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {on && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-navy/[0.08] absolute inset-0 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  >
                    <span className="bg-navy absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full" />
                  </motion.span>
                )}
                <span className="relative">{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={focusSearch}
            className="text-ink ring-line hover:bg-ink/5 grid size-10 place-items-center rounded-full ring-1 transition-colors"
            aria-label="بحث"
          >
            <Search className="size-[18px]" />
          </button>
          <a
            href="#contact"
            className="bg-navy hidden h-10 items-center gap-2 rounded-full px-5 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95 sm:flex"
          >
            <HeartHandshake className="size-4" /> ساهم معنا
          </a>
          <button
            className="text-ink hover:bg-ink/5 grid size-10 place-items-center rounded-full lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {/* reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="from-rose via-melody to-lyrics absolute inset-x-0 bottom-0 h-[2px] origin-right bg-gradient-to-l"
      />

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-line absolute inset-x-0 top-full h-[calc(100dvh-64px)] overflow-y-auto border-t bg-white lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'rounded-2xl px-4 py-4 text-lg font-bold',
                    active === item.href.slice(1) ? 'bg-navy/[0.06] text-navy' : 'text-ink hover:bg-surface',
                  )}
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="bg-navy mt-4 flex h-12 items-center justify-center gap-2 rounded-full text-base font-bold text-white"
              >
                <HeartHandshake className="size-5" /> ساهم معنا
              </a>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
