import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import clsx from 'clsx'

/**
 * Card that tilts toward the cursor and shows a soft spotlight where the pointer is.
 * Falls back to a plain card on touch devices (no hover).
 */
export default function TiltCard({ as = 'div', className, children, max = 6, glare = true, ...props }) {
  const M = motion[as]
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 250, damping: 20 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 250, damping: 20 })
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 60%)`

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <M
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={clsx('group relative', className)}
      {...props}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </M>
  )
}
