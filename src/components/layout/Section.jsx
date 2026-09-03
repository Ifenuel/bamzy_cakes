import { motion } from 'framer-motion'
import PageContainer from './PageContainer.jsx'

/**
 * Reusable page section: vertical rhythm + optional soft background + a
 * gentle fade-up entrance when it scrolls into view.
 */
export default function Section({
  children,
  className = '',
  containerClassName = '',
  background = 'none', // 'none' | 'soft' | 'gradient'
}) {
  const backgrounds = {
    none: '',
    soft: 'bg-lilac-soft/40',
    gradient: 'bg-brand-gradient-soft',
  }

  return (
    <motion.section
      className={`py-14 sm:py-20 ${backgrounds[background]} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <PageContainer className={containerClassName}>{children}</PageContainer>
    </motion.section>
  )
}