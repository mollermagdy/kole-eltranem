import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import clsx from 'clsx'
import { toArabic } from '../lib/format'

export function Container({ className, children }) {
  return <div className={clsx('mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function Button({ variant = 'primary', icon: Icon, className, children, ...props }) {
  const styles = {
    primary: 'bg-navy text-white hover:bg-[#151d4d] shadow-[0_6px_16px_-6px_rgb(28_38_99/0.6)]',
    outline: 'bg-white text-ink ring-1 ring-line hover:ring-ink/20 hover:bg-surface',
    ghost: 'text-white/90 hover:text-white',
  }
  return (
    <a
      className={clsx(
        'inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all duration-200 active:scale-[0.97]',
        styles[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-3.5" fill="currentColor" strokeWidth={0} />}
      {children}
    </a>
  )
}

export function Eyebrow({ children, className }) {
  return (
    <span
      className={clsx('bg-violet/10 text-violet inline-block rounded-full px-3 py-1 text-[13px] font-bold', className)}
    >
      {children}
    </span>
  )
}

export function Pill({ children, className }) {
  return (
    <span
      className={clsx('text-ink rounded-full bg-white/75 px-3 py-1 text-[13px] font-bold backdrop-blur-sm', className)}
    >
      {children}
    </span>
  )
}

/** Renders a calligraphy PNG as a mask so it inherits `currentColor`. */
export function Calligraphy({ src, label, className }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={clsx('calligraphy block', className)}
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  )
}

export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  return (
    <Reveal className={clsx(align === 'center' ? 'text-center' : 'text-start', className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-ink text-[28px] leading-tight font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="text-muted mt-4 text-[15px] leading-[30px]">{subtitle}</p>}
    </Reveal>
  )
}

/** Counts up to `value` once scrolled into view, rendered with Arabic-Indic digits. */
export function CountUp({ value, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value])

  return (
    <span ref={ref} className={className}>
      {toArabic(n)}
    </span>
  )
}
