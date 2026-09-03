import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-brand-gradient text-white shadow-card hover:shadow-glow',
  secondary: 'bg-lilac-soft text-lilac-deep hover:bg-pink-soft',
  outline: 'border border-lilac-deep/30 text-lilac-deep hover:bg-lilac-soft',
  ghost: 'text-ink hover:bg-lilac-soft/60',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

/**
 * Reusable brand button. Renders a <button>, or a router <Link> when `to` is
 * passed, or a plain <a> when `href` is passed.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold
    transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
  }

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      </motion.div>
    )
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...props}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button className={classes} {...motionProps} {...props}>
      {children}
    </motion.button>
  )
}