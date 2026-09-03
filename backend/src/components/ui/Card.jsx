import { motion } from 'framer-motion'

/**
 * Reusable rounded card with soft shadow and a subtle hover lift.
 * Pass `as="div"` behavior is default; just compose children inside.
 */
export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      className={`rounded-xl2 border border-lilac-soft bg-white shadow-soft ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 30px -8px rgba(240,75,138,0.22)' } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}