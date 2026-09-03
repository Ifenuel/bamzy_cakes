import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { apiGetReviews, apiSubmitReview } from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ui/ScrollReveal.jsx'

function ReviewForm({ onSuccess }) {
  const { isAuthenticated, user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isAuthenticated) {
    return (
      <ScrollReveal preset="scaleUp" className="rounded-2xl border border-lilac-soft bg-brand-gradient-subtle p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
          <MessageCircle size={20} />
        </span>
        <p className="mt-4 text-sm text-ink-muted">
          <a href="/login" className="font-semibold text-pink hover:underline">Sign in</a>{' '}
          to share your experience with Bamzy.
        </p>
      </ScrollReveal>
    )
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <CheckCircle size={32} className="mx-auto text-green-500" />
        </motion.div>
        <p className="mt-3 font-heading text-lg font-bold text-ink">Thank you, {user?.full_name?.split(' ')[0]}!</p>
        <p className="mt-1 text-sm text-ink-muted">Your feedback helps us serve you better.</p>
      </motion.div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating < 1) { setError('Please select a rating'); return }
    if (text.trim().length < 5) { setError('Please write at least 5 characters'); return }
    setIsSubmitting(true)
    setError('')
    try {
      await apiSubmitReview({ rating, text: text.trim() })
      setSubmitted(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollReveal preset="scaleUp">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft sm:p-8">
        <h3 className="font-heading text-lg font-bold text-ink">Leave a Review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Share your experience as {user?.full_name?.split(' ')[0]}.
        </p>

        {/* Star Rating */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-ink">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="transition-colors"
              >
                <Star
                  size={30}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-pink fill-pink'
                      : 'text-lilac-soft'
                  }
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="mt-4">
          <label htmlFor="review-text" className="mb-1.5 block text-sm font-medium text-ink">Your Review</label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => { setText(e.target.value); if (error) setError('') }}
            rows={3}
            placeholder="Tell us what you loved about Bamzy..."
            className="w-full resize-none rounded-xl border border-lilac-soft px-4 py-3 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={14} />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </motion.button>
      </form>
    </ScrollReveal>
  )
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    apiGetReviews().then(setReviews).catch(() => {})
  }, [])

  function handleReviewSubmitted() {
    apiGetReviews().then(setReviews).catch(() => {})
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal preset="fadeUp" className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-ink-muted">Real feedback from people who love Bamzy.</p>
        </ScrollReveal>

        {reviews.length === 0 ? (
          <ScrollReveal preset="scaleUp" className="mx-auto mt-12 max-w-lg rounded-2xl border border-lilac-soft bg-brand-gradient-subtle py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <MessageCircle size={26} />
            </span>
            <p className="mt-4 font-heading text-lg font-semibold text-ink">No reviews yet</p>
            <p className="mt-1 text-sm text-ink-muted">Be the first to share your Bamzy experience!</p>
          </ScrollReveal>
        ) : (
          <StaggerContainer className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {reviews.map((review) => (
              <StaggerItem key={review.id}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft transition-shadow hover:shadow-card">
                  <div className="flex gap-0.5 text-pink">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 border-t border-lilac-soft/60 pt-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient-soft text-xs font-bold text-lilac-deep">
                      {review.customer_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-ink">{review.customer_name}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Review Form */}
        <div className="mx-auto mt-12 max-w-lg">
          <ReviewForm onSuccess={handleReviewSubmitted} />
        </div>
      </div>
    </section>
  )
}
