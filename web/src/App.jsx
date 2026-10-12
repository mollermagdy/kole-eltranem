import { useEffect } from 'react'
import Lenis from 'lenis'
import { Toaster } from 'sonner'
import { MotionConfig } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import Doors from './components/Doors'
import Showcase from './components/Showcase'
import Process from './components/Process'
import Archive from './components/Archive'
import Contact from './components/Contact'
import Footer from './components/Footer'

/** Smooth, inertia-based scrolling (skipped when the user prefers reduced motion). */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ anchors: { offset: -72 }, lerp: 0.12 })
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])
}

export default function App() {
  useSmoothScroll()
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <Doors />
        <Showcase />
        <Process />
        <Archive />
        <Contact />
      </main>
      <Footer />
      <Toaster position="bottom-center" dir="rtl" richColors toastOptions={{ style: { fontFamily: 'Tajawal' } }} />
    </MotionConfig>
  )
}
