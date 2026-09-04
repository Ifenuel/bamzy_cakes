import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Upload, Image } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetTrainings, apiCreateTraining, apiUpdateTraining, apiDeleteTraining, apiUploadImage, getImgUrl } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'

const EMPTY = { title: '', slug: '', description: '', price: '', date: '', start_time: '', end_time: '', location: '', capacity: '', what_you_will_learn: '', requirements: '', image_url: '' }

export default function AdminTrainings() {
  const { showToast } = useToast()
  const [trainings, setTrainings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { apiGetTrainings().then((d) => { setTrainings(d); setIsLoading(false) }) }, [])

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true) }
  function openEdit(t) {
    setEditing(t.id)
    setForm({
      title: t.title, slug: t.slug, description: t.description || '',
      price: String(t.price), date: t.date?.split('T')[0] || '',
      start_time: t.startTime || '', end_time: t.endTime || '',
      location: t.location || '', capacity: String(t.capacity || ''),
      what_you_will_learn: Array.isArray(t.whatYouWillLearn) ? t.whatYouWillLearn.join('\n') : '',
      requirements: Array.isArray(t.requirements) ? t.requirements.join('\n') : '',
      image_url: t.imageUrl || t.image_url || '',
    })
    setShowForm(true)
  }

  function handleChange(e) { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })) }

  const imageInputRef = useRef(null)

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    try {
      const result = await apiUploadImage('trainings', file)
      setForm(prev => ({ ...prev, image_url: result.imageUrl }))
      showToast('Image uploaded!', 'success')
    } catch (err) { showToast(err.message || 'Upload failed', 'error') }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description, price: parseInt(form.price) || 0,
      date: form.date, start_time: form.start_time, end_time: form.end_time,
      location: form.location, capacity: parseInt(form.capacity) || 10,
      what_you_will_learn: form.what_you_will_learn.split('\n').filter(Boolean),
      requirements: form.requirements.split('\n').filter(Boolean),
      image_url: form.image_url || null,
    }
    try {
      if (editing) { await apiUpdateTraining(editing, payload); showToast('Training updated.', 'success') }
      else { await apiCreateTraining(payload); showToast('Training created.', 'success') }
      setShowForm(false)
      apiGetTrainings().then(setTrainings)
    } catch (err) { showToast(err.message || 'Failed', 'error') }
  }

  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function handleDelete(id) {
    try { await apiDeleteTraining(id); showToast('Training deleted.', 'info'); setDeleteConfirm(null); apiGetTrainings().then(setTrainings) }
    catch (err) { showToast(err.message || 'Failed', 'error') }
  }

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading trainings...</div>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-heading text-2xl font-bold text-ink">Trainings</h1><p className="text-sm text-ink-muted">{trainings.length} trainings</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow"><Plus size={16} /> Add Training</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl3 bg-white p-6 shadow-card max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h2 className="font-heading text-lg font-semibold">{editing ? 'Edit' : 'Add'} Training</h2><button onClick={() => setShowForm(false)} className="rounded-full p-1 hover:bg-lilac-soft"><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-ink">Title</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium text-ink">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full resize-none rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-ink">Price</label><input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">Date</label><input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-ink">Start Time</label><input name="start_time" value={form.start_time} onChange={handleChange} placeholder="10:00" className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">End Time</label><input name="end_time" value={form.end_time} onChange={handleChange} placeholder="14:00" className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-medium text-ink">Location</label><input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">Capacity</label><input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-ink">What Students Will Learn (one per line)</label><textarea name="what_you_will_learn" value={form.what_you_will_learn} onChange={handleChange} rows={3} className="w-full resize-none rounded-xl border border-lilac-soft px-3 py-2 text-sm focus:border-lilac focus:outline-none" /></div>
              {/* Image Upload */}
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">Training Image</label>
                <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => imageInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-lilac-soft bg-lilac-soft/20 px-4 py-6 text-sm text-ink-muted hover:border-pink hover:text-pink transition-colors">
                  {form.image_url ? (<><Image size={16} /> Image uploaded — click to replace</>) : (<><Upload size={16} /> Upload training image</>)}
                </button>
                {form.image_url && (<img src={getImgUrl(form.image_url)} alt="Preview" className="mt-2 h-24 w-full rounded-lg object-cover" />)}
              </div>
              <button type="submit" className="w-full rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card hover:shadow-glow">{editing ? 'Save Changes' : 'Create Training'}</button>
            </form>
          </motion.div>
        </div>
      )}
      <div className="mt-4 space-y-3">
        {trainings.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl2 border border-lilac-soft bg-white p-4 shadow-soft sm:p-5">
            {(t.imageUrl || t.image_url) && !(t.imageUrl || t.image_url).startsWith('/uploads/') && (<img src={getImgUrl(t.imageUrl || t.image_url)} alt={t.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" />)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              <p className="text-xs text-ink-muted">{fd(t.date)} | {t.startTime}-{t.endTime} | {formatNaira(t.price)}</p>
              <p className="text-xs text-ink-muted">{t.availableSpaces} of {t.capacity} spots available</p>
            </div>
            <div className="flex gap-1"><button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-ink-muted hover:bg-lilac-soft hover:text-pink"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteConfirm(t)} className="rounded-lg p-1.5 text-ink-muted hover:bg-pink-soft hover:text-pink"><Trash2 size={14} /></button></div>
          </div>
        ))}
        {trainings.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No trainings yet.</p>}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-soft"><Trash2 size={18} className="text-error" /></div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-ink">Delete Training</h3>
                  <p className="text-xs text-ink-muted">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-ink-muted mb-5">Are you sure you want to delete <span className="font-semibold text-ink">{deleteConfirm.title}</span>? All registration data for this training will be lost.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-full border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 rounded-full bg-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Delete Training</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
