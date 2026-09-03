import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ImagePlaceholder from '../../components/common/ImagePlaceholder.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { apiGetTrainingById, apiRegisterForTraining } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

export default function TrainingDetails() {
  const { trainingId } = useParams()
  const { showToast } = useToast()
  const [training, setTraining] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', students: 1 })
  const [errors, setErrors] = useState({})
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    let ok = true
    apiGetTrainingById(trainingId).then((d) => { if (ok) { setTraining(d); setIsLoading(false) } })
    return () => { ok = false }
  }, [trainingId])

  if (isLoading) return <LoadingSpinner label="Loading training..." />
  if (!training) return (
    <Section><PageContainer><div className="py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold">Training not found</h1>
      <div className="mt-6"><Button to="/trainings">Back to Trainings</Button></div>
    </div></PageContainer></Section>
  )

  const fd = new Date(training.date).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const total = training.price * form.students
  const hasImage = training.imageUrl && !imgError

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: name === 'students' ? Math.max(1, parseInt(value) || 1) : value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Name is required.'
    if (!form.phone.trim()) errs.phone = 'Phone is required.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email.'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    const reg = await apiRegisterForTraining(trainingId, { full_name: form.fullName, phone: form.phone, email: form.email, number_of_students: form.students })
    setIsSubmitting(false)
    if (reg) {
      showToast('Registration confirmed! We will contact you soon.', 'success')
      setTraining((p) => ({ ...p, availableSpaces: Math.max(0, p.availableSpaces - 1) }))
      setShowForm(false)
      setForm({ fullName: '', phone: '', email: '', students: 1 })
    } else {
      showToast('Sorry, this training is fully booked.', 'error')
    }
  }

  const ic = 'w-full rounded-xl2 border border-lilac-soft bg-white px-4 py-3 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <Section><PageContainer>
      <Link to="/trainings" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-lilac-deep transition-colors hover:text-pink"><ArrowLeft size={16} /> Back to Trainings</Link>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="overflow-hidden rounded-xl2 shadow-soft">
          {hasImage ? (
            <img src={getImgUrl(training.imageUrl)} alt={training.title} className="aspect-square w-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <ImagePlaceholder label={training.title} className="aspect-square w-full" iconSize={48} />
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col gap-5">
          <Badge tone="lilac" className="w-fit">Training</Badge>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">{training.title}</h1>
          <p className="text-ink-muted leading-relaxed">{training.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-ink-muted">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-pink" /> {fd}</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-pink" /> {training.startTime}{training.endTime ? ' - ' + training.endTime : ''}</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="text-pink" /> {training.location}</span>
            <span className="flex items-center gap-2"><Users size={16} className="text-pink" /> {training.availableSpaces} spots available</span>
          </div>
          {training.whatYouWillLearn && (
            <div><h3 className="font-heading text-lg font-semibold">What You Will Learn</h3>
              <ul className="mt-2 space-y-2">{training.whatYouWillLearn.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted"><CheckCircle size={16} className="mt-0.5 shrink-0 text-pink" /> {l}</li>
              ))}</ul>
            </div>
          )}
          {training.requirements && <p className="text-sm text-ink-muted"><span className="font-medium text-ink">Requirements:</span> {training.requirements}</p>}
          <div className="flex items-center gap-4"><span className="text-2xl font-bold text-pink">{formatNaira(training.price)}</span><span className="text-sm text-ink-muted">per person</span></div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} disabled={training.availableSpaces === 0} className="w-full sm:w-auto" size="lg">
              {training.availableSpaces === 0 ? 'Fully Booked' : 'Book This Training'}
            </Button>
          ) : (
            <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft">
              <h3 className="font-heading text-lg font-semibold">Book Your Spot</h3>
              <div><label className="mb-1 block text-sm font-medium text-ink">Full Name *</label><input name="fullName" value={form.fullName} onChange={handleChange} className={ic} />{errors.fullName && <p className="mt-1 text-xs text-pink">{errors.fullName}</p>}</div>
              <div><label className="mb-1 block text-sm font-medium text-ink">Phone *</label><input name="phone" value={form.phone} onChange={handleChange} className={ic} />{errors.phone && <p className="mt-1 text-xs text-pink">{errors.phone}</p>}</div>
              <div><label className="mb-1 block text-sm font-medium text-ink">Email</label><input name="email" value={form.email} onChange={handleChange} className={ic} /></div>
              <div><label className="mb-1 block text-sm font-medium text-ink">Number of Students</label><input type="number" name="students" min={1} max={training.availableSpaces} value={form.students} onChange={handleChange} className={ic} /></div>
              <div className="flex justify-between text-sm"><span className="text-ink-muted">Total ({form.students} x {formatNaira(training.price)})</span><span className="font-bold text-pink">{formatNaira(total)}</span></div>
              <button type="submit" disabled={isSubmitting} className={'flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition-all ' + (isSubmitting ? 'cursor-not-allowed bg-ink/30' : 'bg-brand-gradient shadow-card hover:shadow-glow')}>
                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </PageContainer></Section>
  )
}
