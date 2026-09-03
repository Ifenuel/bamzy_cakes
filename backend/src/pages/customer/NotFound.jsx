import { motion } from 'framer-motion'
import { CakeSlice } from 'lucide-react'
import Section from '../../components/layout/Section.jsx'
import Button from '../../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl3 border border-lilac-soft bg-brand-gradient-soft px-8 py-20 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-pink shadow-soft">
          <CakeSlice size={30} />
        </span>
        <h1 className="font-heading text-4xl font-semibold text-ink">Page not found</h1>
        <p className="text-sm text-ink-muted">
          This page doesn't exist yet, or the link may be out of date. Let's get you back to
          somewhere sweeter.
        </p>
        <Button to="/">Back to home</Button>
      </motion.div>
    </Section>
  )
}