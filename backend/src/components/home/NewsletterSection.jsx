import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { apiSubscribeNewsletter } from '../../utils/api.js'
import ScrollReveal from '../ui/ScrollReveal.jsx'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const result = await apiSubscribeNewsletter(email)
      setSuccessMsg(result?.message || 'Successfully subscribed!')
      setSubmitted(true)
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="border-y border-lilac-soft/60 bg-brand-gradient-subtle py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal preset="fadeUp" className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
            Newsletter
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Stay in the loop
          </h2>
          <p className="mt-3 text-ink-muted">
            Get updates about today&apos;s treats, new products, upcoming trainings,
            special offers and events.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <CheckCircle size={28} className="text-green-500" />
              <p className="text-sm font-semibold text-green-700">{successMsg || "You're subscribed!"}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                placeholder="Enter your email address"
                className="flex-1 rounded-full border border-lilac-soft bg-white px-5 py-3.5 text-sm text-ink placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Subscribing...</>
                ) : 'Subscribe'}
              </motion.button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-sm text-error">{error}</p>
          )}

          <p className="mt-4 text-xs text-ink-muted">
            No spam, just the good stuff. Unsubscribe anytime.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
