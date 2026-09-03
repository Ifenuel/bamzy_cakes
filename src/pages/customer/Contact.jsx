import { useState } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { useToast } from '../../components/ui/Toast.jsx'

const CONTACT_INFO = [
  { icon: Phone, label: 'Phone', value: '+234 7033374470', href: 'tel:+2347033374470' },
  { icon: Mail, label: 'Email', value: 'hello@bamzycakes.com', href: 'mailto:hello@bamzycakes.com' },
  { icon: MapPin, label: 'Address', value: 'Alakia, Ibadan, Nigeria', href: '#' },
  { icon: Instagram, label: 'Instagram', value: '@bamzycakes', href: 'https://instagram.com/bamzycakes', external: true },
  { icon: Facebook, label: 'Facebook', value: 'Bamzy Cakes', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+234 7033374470', href: 'https://wa.me/2347033374470', external: true },
]

export default function Contact() {
  const { showToast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.message.trim()) errs.message = 'Message is required.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email.'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitted(true)
    showToast('Message sent! We will get back to you soon.', 'success')
  }

  const ic = 'w-full rounded-xl2 border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'
  const ec = 'text-xs text-pink mt-1'

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with Bamzy Cakes & Confectionery. Order enquiries, event bookings and custom cake requests." />
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Contact Us</h1>
            <p className="mt-3 text-ink-muted">We would love to hear from you. Reach out anytime!</p>
          </div>
        </PageContainer>
      </Section>
      <Section>
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="font-heading text-xl font-bold">Get in Touch</h2>
              <div className="mt-6 space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href, external }) => (
                  <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex items-center gap-3 rounded-xl2 border border-lilac-soft bg-white px-4 py-3 shadow-soft transition-colors hover:border-lilac">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft text-pink"><Icon size={18} /></span>
                    <div><p className="text-xs text-ink-muted">{label}</p><p className="text-sm font-medium text-ink">{value}</p></div>
                  </a>
                ))}
              </div>
              <div className="mt-6 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-5">
                <h3 className="font-heading text-base font-semibold">Business Hours</h3>
                <p className="mt-2 text-sm text-ink-muted">Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p className="text-sm text-ink-muted">Saturday: 9:00 AM - 4:00 PM</p>
                <p className="text-sm text-ink-muted">Sunday: Closed</p>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Send a Message</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-8 text-center">
                  <CheckCircle size={32} className="mx-auto text-pink" />
                  <h3 className="mt-3 font-heading text-lg font-semibold">Message Sent!</h3>
                  <p className="mt-1 text-sm text-ink-muted">Thank you for reaching out. We will get back to you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div><label className="mb-1 block text-sm font-medium text-ink">Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={ic} />{errors.name && <p className={ec}>{errors.name}</p>}</div>
                  <div><label className="mb-1 block text-sm font-medium text-ink">Email</label><input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={ic} />{errors.email && <p className={ec}>{errors.email}</p>}</div>
                  <div><label className="mb-1 block text-sm font-medium text-ink">Phone</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="08012345678" className={ic} /></div>
                  <div><label className="mb-1 block text-sm font-medium text-ink">Message *</label><textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="How can we help?" className={ic + ' resize-none'} />{errors.message && <p className={ec}>{errors.message}</p>}</div>
                  <button type="submit" className="w-full rounded-full bg-brand-gradient px-8 py-4 text-base font-semibold text-white shadow-card transition-all hover:shadow-glow">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}