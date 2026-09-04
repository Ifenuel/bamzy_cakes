import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Button from '../ui/Button.jsx'
import PageContainer from '../layout/PageContainer.jsx'
import { getImgUrl, apiTrackEvent, apiGetSettings } from '../../utils/api.js'

function HeroImage({ heroImage }) {
  const [error, setError] = useState(false)
  const src = getImgUrl(heroImage)
  if (src && !error) {
    return (
      <img
        src={src}
        alt="Beautiful Bamzy celebration cake"
        className="w-full max-h-[500px] object-contain"
        loading="eager"
        onError={() => setError(true)}
      />
    )
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-lilac-soft/60 via-pink-soft/40 to-cream">
      <div className="text-center">
        <p className="font-heading text-4xl font-bold text-lilac/30 sm:text-5xl">🧁</p>
        <p className="mt-2 text-sm font-medium text-lilac/50">Upload a hero image in admin settings</p>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 30])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [heroImage, setHeroImage] = useState('')

  useEffect(() => {
    apiTrackEvent('page_view', { page: 'home' })
    apiGetSettings().then((s) => {
      if (s?.hero_image) setHeroImage(s.hero_image)
    }).catch(() => {})
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-warm-gradient">
      <PageContainer className="grid grid-cols-1 items-center gap-6 py-8 sm:py-10 lg:grid-cols-12 lg:gap-0 lg:py-0">
        {/* Left — Text */}
        <motion.div style={{ y: textY, opacity }} className="relative z-10 lg:col-span-5 lg:pr-8 lg:py-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-lilac"
            >
              Bamzy Cakes & Confectionery
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[3.5rem]"
            >
              Sweet moments
              <br />
              <span className="text-gradient">start here.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-md text-base leading-relaxed text-ink-muted"
            >
              Freshly baked cakes, pastries, small chops, tiger nuts and
              delicious treats made with love in Nigeria.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <Button to="/shop" size="lg">Shop Today&apos;s Treats</Button>
              <Button to="/events" variant="outline" size="lg">Plan an Event</Button>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex items-center gap-5 border-t border-lilac-soft/60 pt-5"
            >
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
                <p className="text-base font-bold text-ink">Baked Fresh</p>
                <p className="text-xs text-ink-muted">Every single day</p>
              </motion.div>
              <div className="h-7 w-px bg-lilac-soft" />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.4 }}>
                <p className="text-base font-bold text-ink">Made with Love</p>
                <p className="text-xs text-ink-muted">Premium ingredients</p>
              </motion.div>
              <div className="h-7 w-px bg-lilac-soft hidden sm:block" />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.4 }} className="hidden sm:block">
                <p className="text-base font-bold text-ink">SW Nigeria</p>
                <p className="text-xs text-ink-muted">Delivery & pickup</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right — Image with parallax */}
        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative lg:col-span-7"
        >
          <div className="relative overflow-hidden rounded-2xl lg:rounded-none lg:rounded-tl-[3rem] lg:rounded-bl-[3rem]">
            <HeroImage heroImage={heroImage} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-2 shadow-elevated backdrop-blur-sm"
            >
              <p className="text-xs font-medium text-ink-muted">Currently serving</p>
              <p className="text-sm font-bold text-ink">Ibadan & Southwest Nigeria</p>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  )
}
