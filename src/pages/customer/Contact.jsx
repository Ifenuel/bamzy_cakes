import { useState } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { Phone, Mail, MapPin, Instagram, MessageCircle, CheckCircle, Clock, Send, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { apiSendContact } from '../../utils/api.js'

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+234 703 337 4470',
    href: 'tel:+2347033374470',
    description: 'Mon–Sat, 8am–6pm',
    color: 'from-lilac to-lilac-deep',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat with us',
    href: 'https://wa.me/2347033374470',
    external: true,
    description: 'Quick replies, always',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'bamzycakes621@gmail.com',
    href: 'mailto:bamzycakes621@gmail.com',
    description: 'We reply within 24 hours',
    color: 'from-pink to-pink/80',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@bamzycakes',
    href: 'https://instagram.com/bamzycakes',
    external: true,
    description: 'Follow for daily treats',
    color: 'from-purple-500 to-pink-500',
  },
]

const BUSINESS_HOURS = [
  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM', open: true },
  { day: 'Saturday', hours: '9:00 AM – 4:00 PM', open: true },
  { day: 'Sunday', hours: 'Closed', open: false },
]

export default function Contact() {
  const { showToast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'general', message: '' })
  const [errors, setErrors] = useState({})
  const [isSending, setIsSending] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.message.trim()) errs.message = 'Message is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (form.phone && !/^[\d\s+\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsSending(true)
    try {
      await apiSendContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      })
      setSubmitted(true)
      showToast('Message sent! We will get back to you soon.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to send message. Please try again.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with Bamzy Cakes & Confectionery. Order enquiries, event bookings and custom cake requests in Ibadan and Southwest Nigeria." />

      {/* Hero */}
      <Section background="gradient" className="pt-10 pb-12 sm:pt-14 sm:pb-16">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-soft/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink">
              <MessageCircle size={12} />
              We&apos;d Love to Hear From You
            </span>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
              Let&apos;s Talk
            </h1>
            <p className="mt-4 text-lg text-ink-muted">
              Whether it&apos;s a custom cake order, event booking, or just a question — we&apos;re here for you.
            </p>
          </motion.div>
        </PageContainer>
      </Section>

      {/* Contact Methods */}
      <Section className="relative -mt-6">
        <PageContainer>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {CONTACT_METHODS.map(({ icon: Icon, label, value, href, external, description, color }, i) => (
              <motion.a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-lilac-soft bg-white p-5 shadow-xs transition-all hover:shadow-lg hover:border-lilac"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm transition-transform group-hover:scale-110`}>
                  <Icon size={18} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
                <p className="mt-1 text-sm font-semibold text-ink truncate">{value}</p>
                <p className="mt-1 text-[11px] text-ink-light">{description}</p>
                <ArrowRight size={14} className="absolute right-4 top-4 text-ink-light opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </motion.a>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Form + Hours */}
      <Section className="pt-4 sm:pt-6">
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold text-ink">Send Us a Message</h2>
                <p className="mt-2 text-sm text-ink-muted">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
              </motion.div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckCircle size={32} className="text-green-600" />
                  </motion.div>
                  <h3 className="font-heading text-xl font-bold text-ink">Message Sent!</h3>
                  <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
                    Thank you for reaching out to Bamzy Cakes. We typically respond within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: 'general', message: '' }) }}
                    className="mt-5 rounded-full border border-lilac-soft bg-white px-6 py-2.5 text-sm font-medium text-ink hover:bg-lilac-soft transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="mt-8 space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Your Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className={`w-full rounded-xl border ${errors.name ? 'border-pink' : 'border-lilac-soft'} bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-light/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-pink">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border ${errors.email ? 'border-pink' : 'border-lilac-soft'} bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-light/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-pink">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0801 234 5678"
                        className={`w-full rounded-xl border ${errors.phone ? 'border-pink' : 'border-lilac-soft'} bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-light/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-pink">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">What&apos;s this about?</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                      >
                        <option value="general">General Enquiry</option>
                        <option value="order">Order Issue</option>
                        <option value="custom-cake">Custom Cake Request</option>
                        <option value="event">Event Booking</option>
                        <option value="training">Training Question</option>
                        <option value="partnership">Partnership / Collaboration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className={`w-full resize-none rounded-xl border ${errors.message ? 'border-pink' : 'border-lilac-soft'} bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-light/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-pink">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-4 text-base font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:inline-flex"
                  >
                    {isSending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Hours */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-pink">
                    <Clock size={16} />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-ink">Business Hours</h3>
                </div>
                <div className="space-y-3">
                  {BUSINESS_HOURS.map(({ day, hours, open }) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-ink-muted">{day}</span>
                      <span className={`text-sm font-medium ${open ? 'text-ink' : 'text-ink-light'}`}>{hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-brand-gradient-subtle p-3 text-center">
                  <p className="text-xs text-ink-muted">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                    We reply to WhatsApp messages fastest
                  </p>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-pink">
                    <MapPin size={16} />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-ink">Our Location</h3>
                </div>
                <p className="text-sm text-ink-muted">Alakia, Ibadan, Oyo State, Nigeria</p>
                <p className="mt-2 text-xs text-ink-light">We serve all of Southwest Nigeria including Lagos, Ogun, Ondo, Ekiti, and Osun states.</p>
              </motion.div>

              {/* Quick CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl bg-gradient-to-br from-lilac to-pink p-6 text-white"
              >
                <h3 className="font-heading text-lg font-bold">Need a Custom Cake?</h3>
                <p className="mt-2 text-sm text-white/80">Tell us your vision and we will bring it to life. From wedding cakes to birthday masterpieces.</p>
                <a
                  href="https://wa.me/2347033374470?text=Hi%20Bamzy!%20I%27d%20like%20to%20order%20a%20custom%20cake."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-lilac-deep transition-all hover:shadow-lg hover:scale-105"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </motion.div>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}
