import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import { createEventBooking } from '../../services/bookingService.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { apiGetSettings } from '../../utils/api.js'

const DEFAULT_EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'bridal_shower', label: 'Bridal Shower' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'private_event', label: 'Private Party' },
  { value: 'other', label: 'Other' },
]
const DEFAULT_SERVICES = ['Cakes', 'Small Chops', 'Pastries', 'Full Catering', 'Dessert Table', 'Event Setup', 'Tiger Nuts & Drinks']

export default function EventsBook() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [errors, setErrors] = useState({})
  const [eventTypes, setEventTypes] = useState(DEFAULT_EVENT_TYPES)
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [form, setForm] = useState({
    customerName: '', phone: '', email: '', eventType: '', eventDate: '', location: '', guestCount: '', selectedServices: [], notes: '',
  })

  useEffect(() => {
    apiGetSettings().then((settings) => {
      if (Array.isArray(settings?.event_types_dropdown) && settings.event_types_dropdown.length > 0) {
        setEventTypes(settings.event_types_dropdown)
      }
      if (Array.isArray(settings?.event_services) && settings.event_services.length > 0) {
        setServices(settings.event_services)
      }
    }).catch(() => {})
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  function toggleService(s) {
    setForm((p) => ({ ...p, selectedServices: p.selectedServices.includes(s) ? p.selectedServices.filter((x) => x !== s) : [...p.selectedServices, s] }))
  }

  function validate() {
    const errs = {}
    if (!form.customerName.trim()) errs.customerName = 'Name is required.'
    if (!form.phone.trim()) errs.phone = 'Phone is required.'
    if (!form.eventType) errs.eventType = 'Select an event type.'
    if (!form.eventDate) errs.eventDate = 'Event date is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.guestCount || parseInt(form.guestCount) < 1) errs.guestCount = 'Enter expected guests.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      const booking = await createEventBooking({
        full_name: form.customerName, email: form.email, phone: form.phone,
        event_type: form.eventType, event_date: form.eventDate, event_location: form.location,
        guest_count: parseInt(form.guestCount), services_requested: form.selectedServices, notes: form.notes,
      })
      setBookingRef(booking.id)
      setSubmitted(true)
      showToast('Booking submitted successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error')
    }
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <Section><PageContainer>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg rounded-xl3 border border-lilac-soft bg-brand-gradient-soft px-8 py-16 text-center shadow-soft">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-pink shadow-soft"><CheckCircle size={32} /></motion.div>
          <h1 className="mt-6 font-heading text-3xl font-bold">Booking Received!</h1>
          <p className="mt-2 text-ink-muted">Thank you! We will review your request and get back to you within 24 hours.</p>
          <p className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-lilac-deep shadow-soft">Reference: {bookingRef}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button to="/events" variant="secondary">View Events</Button>
            <Button to="/shop">Shop Treats</Button>
          </div>
        </motion.div>
      </PageContainer></Section>
    )
  }

  const ic = 'w-full rounded-xl2 border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'
  const ec = 'text-xs text-pink mt-1'

  return (
    <Section><PageContainer>
      <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-lilac-deep transition-colors hover:text-pink"><ArrowLeft size={16} /> Back to Events</Link>
      <h1 className="font-heading text-3xl font-bold sm:text-4xl">Book an Event</h1>
      <p className="mt-2 text-ink-muted">Fill in the details below and we will get back to you with a custom quote.</p>
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl space-y-6">
        <div className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft space-y-4">
          <h2 className="font-heading text-lg font-semibold">Your Details</h2>
          <div><label className="mb-1 block text-sm font-medium text-ink">Full Name *</label><input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Your full name" className={ic} />{errors.customerName && <p className={ec}>{errors.customerName}</p>}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-ink">Phone *</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="08012345678" className={ic} />{errors.phone && <p className={ec}>{errors.phone}</p>}</div>
            <div><label className="mb-1 block text-sm font-medium text-ink">Email</label><input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={ic} /></div>
          </div>
        </div>
        <div className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft space-y-4">
          <h2 className="font-heading text-lg font-semibold">Event Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-ink">Event Type *</label>
              <select name="eventType" value={form.eventType} onChange={handleChange} className={ic}><option value="">Select type</option>{eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
              {errors.eventType && <p className={ec}>{errors.eventType}</p>}</div>
            <div><label className="mb-1 block text-sm font-medium text-ink">Event Date *</label><input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} className={ic} />{errors.eventDate && <p className={ec}>{errors.eventDate}</p>}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-ink">Location *</label><input name="location" value={form.location} onChange={handleChange} placeholder="City, State" className={ic} />{errors.location && <p className={ec}>{errors.location}</p>}</div>
            <div><label className="mb-1 block text-sm font-medium text-ink">Expected Guests *</label><input type="number" name="guestCount" min={1} value={form.guestCount} onChange={handleChange} placeholder="100" className={ic} />{errors.guestCount && <p className={ec}>{errors.guestCount}</p>}</div>
          </div>
        </div>
        <div className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft space-y-4">
          <h2 className="font-heading text-lg font-semibold">Services Required</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={'rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ' + (form.selectedServices.includes(s) ? 'border-pink bg-pink-soft text-pink' : 'border-lilac-soft text-ink-muted hover:border-lilac')}>
                {form.selectedServices.includes(s) && <span className="mr-1">&#10003;</span>}{s}
              </button>
            ))}
          </div>
          <div><label className="mb-1 block text-sm font-medium text-ink">Additional Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any special requests..." className={ic + ' resize-none'} /></div>
        </div>
        <button type="submit" disabled={isSubmitting} className={'flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-card transition-all ' + (isSubmitting ? 'cursor-not-allowed bg-ink/30' : 'bg-brand-gradient hover:shadow-glow')}>
          {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>
    </PageContainer></Section>
  )
}
