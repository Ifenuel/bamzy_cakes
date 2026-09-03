import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PRESETS = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleRotate: {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  },
}

/**
 * Reusable scroll-reveal animation wrapper.
 * Use preset names: fadeUp, fadeDown, fadeLeft, fadeRight, fadeIn, scaleUp
 * or pass custom { hidden, visible } variants.
 */
export default function ScrollReveal({
  children,
  preset = 'fadeUp',
  custom,
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
  className = '',
  once = true,
  as = 'div',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const variants = custom || PRESETS[preset] || PRESETS.fadeUp
  const easing = [0.22, 1, 0.36, 1]

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration, delay, ease: easing }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered container — wraps children and staggers their animations.
 * Each child must use motion.div with variants.
 */
export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
  delay = 0,
  once = true,
  threshold = 0.1,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered child — use inside StaggerContainer.
 */
export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
