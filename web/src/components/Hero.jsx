import { motion, useScroll, useTransform } from 'framer-motion'
import clsx from 'clsx'
import logo from '../assets/logo.webp'
import arc from '../assets/music-arc.webp'
import instruments from '../assets/hero-instruments.webp'
import { heroTags } from '../data/content'
import { Container } from './ui'
import SearchBox from './SearchBox'

function FloatingTag({ label, className, pos, i }) {
  return (
    <motion.a
      href="#doors"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35 + i * 0.12, type: 'spring', stiffness: 220, damping: 16 }}
      className={clsx('absolute z-10', pos)}
    >
      <motion.span
        animate={{ y: [0, -8, 0] }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        transition={{ y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } }}
        className={clsx(
          'block rounded-full px-3 py-1 text-[13px] sm:px-5 sm:py-1.5 sm:text-lg font-bold whitespace-nowrap shadow-[0_10px_24px_-10px_rgb(0_0_0/0.35)] lg:text-xl',
          className,
        )}
      >
        {label}
      </motion.span>
    </motion.a>
  )
}

/** Logo with the tagline curved along an arc beneath it. */
function LogoMark() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-[220px] sm:w-[280px] lg:w-[300px]"
    >
      <motion.img
        src={logo}
        alt="كل الترانيم"
        initial={{ rotate: -6 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full drop-shadow-[0_18px_30px_rgb(28_38_99/0.18)]"
      />
      {/* tagline sits under the ring on a shallow curve, centered */}
      <svg
        viewBox="0 0 300 60"
        aria-label="أصل وفصل كل ترنيمة"
        className="pointer-events-none relative -mt-[6%] w-full overflow-visible"
      >
        <defs>
          {/* shallow smile, drawn left → right so the glyphs sit upright */}
          <path id="tagline-arc" d="M 30 18 Q 150 52 280 18" />
        </defs>
        <motion.text
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="fill-rose font-sans font-bold"
          fontSize="22"
        >
          <textPath href="#tagline-arc" startOffset="50%" textAnchor="middle">
            أصـــل وفصـــل كـــل ترنيمـــة
          </textPath>
        </motion.text>
      </svg>
    </motion.div>
  )
}

export default function Hero() {
  const { scrollY } = useScroll()
  const arcY = useTransform(scrollY, [0, 600], [0, 60])
  const bgY = useTransform(scrollY, [0, 600], [0, -40])

  return (
    <section id="top" className="relative overflow-x-clip bg-white pt-8 pb-16 sm:pt-12 sm:pb-20">
      {/* faded instruments backdrop — flows under the next section's heading */}
      <motion.img
        src={instruments}
        alt=""
        aria-hidden
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-x-0 top-[360px] mx-auto w-[900px] max-w-none [mask-image:linear-gradient(to_bottom,black_45%,transparent_92%)] opacity-50 select-none sm:top-[400px] md:w-[1356px]"
      />

      <Container className="relative">
        <div className="relative mx-auto max-w-[960px] pb-14 sm:pb-16">
          <motion.img
            src={arc}
            alt=""
            aria-hidden
            style={{ y: arcY }}
            className="absolute inset-x-0 top-0 mx-auto w-[520px] max-w-[120%] opacity-90 select-none sm:w-[754px]"
          />
          <LogoMark />
          {heroTags.map((t, i) => (
            <FloatingTag key={t.label} {...t} i={i} />
          ))}
        </div>

        <h1 className="sr-only">كل الترانيم — أصل وفصل كل ترنيمة</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SearchBox />
        </motion.div>
      </Container>
    </section>
  )
}
