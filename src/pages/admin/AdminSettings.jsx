import { useState, useEffect, useRef } from 'react'
import { Settings, Save, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useToast } from '../../components/ui/Toast.jsx'
import { apiGetSettings, apiUpdateSettings, apiUploadImage } from '../../utils/api.js'
import { getImgUrl } from '../../utils/api.js'

export default function AdminSettings() {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    email: '',
    address: '',
    delivery_fee: '',
    business_hours: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    hero_image: '',
    ceo_image: '',
    // About page fields
    about_headline: '',
    about_subtitle: '',
    about_ceo_name: '',
    about_ceo_title: '',
    about_story: '',
    about_values: [],
    about_gallery_images: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    apiGetSettings()
      .then((settings) => {
        const bh = settings.business_hours
        const hoursStr = typeof bh === 'object'
          ? `Mon-Fri: ${bh.monday_friday || ''} | Sat: ${bh.saturday || ''} | Sun: ${bh.sunday || ''}`
          : (bh || '')
        const sl = settings.social_links || {}
        setForm({
          business_name: settings.business_name || '',
          phone: settings.phone || '',
          email: settings.email || '',
          address: settings.address || '',
          delivery_fee: String(settings.delivery_fee || ''),
          business_hours: hoursStr,
          instagram: sl.instagram || '',
          facebook: sl.facebook || '',
          whatsapp: sl.whatsapp || '',
          hero_image: settings.hero_image || '',
          ceo_image: settings.ceo_image || '',
          // About page
          about_headline: settings.about_headline || 'Our Story',
          about_subtitle: settings.about_subtitle || 'A story of passion, flavour and Nigerian sweetness.',
          about_ceo_name: settings.about_ceo_name || '',
          about_ceo_title: settings.about_ceo_title || 'Founder & Head Baker',
          about_story: settings.about_story || '',
          about_values: Array.isArray(settings.about_values)
            ? settings.about_values
            : [
                { title: 'Made With Love', description: 'Every product is prepared with care, using family recipes and modern techniques.' },
                { title: 'Quality First', description: 'We source the finest ingredients and never compromise on taste or presentation.' },
                { title: 'For Every Occasion', description: 'From daily treats to grand celebrations, Bamzy has something for everyone.' },
              ],
          about_gallery_images: Array.isArray(settings.about_gallery_images)
            ? settings.about_gallery_images
            : [],
        })
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  // About page value management
  function updateValue(index, field, value) {
    setForm(prev => {
      const values = [...prev.about_values]
      values[index] = { ...values[index], [field]: value }
      return { ...prev, about_values: values }
    })
  }

  function addValue() {
    setForm(prev => ({
      ...prev,
      about_values: [...prev.about_values, { title: '', description: '' }],
    }))
  }

  function removeValue(index) {
    setForm(prev => ({
      ...prev,
      about_values: prev.about_values.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const hoursParts = form.business_hours.split('|').map((s) => s.trim())
      const business_hours = {
        monday_friday: hoursParts[0]?.replace(/Mon-Fri:\s*/i, '') || '',
        saturday: hoursParts[1]?.replace(/Sat:\s*/i, '') || '',
        sunday: hoursParts[2]?.replace(/Sun:\s*/i, '') || '',
      }

      await apiUpdateSettings({
        business_name: form.business_name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        delivery_fee: parseInt(form.delivery_fee) || 0,
        business_hours,
        social_links: {
          instagram: form.instagram,
          facebook: form.facebook,
          whatsapp: form.whatsapp,
        },
        hero_image: form.hero_image,
        ceo_image: form.ceo_image,
        // About page
        about_headline: form.about_headline,
        about_subtitle: form.about_subtitle,
        about_ceo_name: form.about_ceo_name,
        about_ceo_title: form.about_ceo_title,
        about_story: form.about_story,
        about_values: form.about_values,
        about_gallery_images: form.about_gallery_images,
      })
      showToast('Settings saved to database!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error')
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading settings...</p>
        </div>
      </div>
    )
  }

  const ic =
    'w-full rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'
  const tc = 'w-full resize-none rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient-soft text-pink">
          <Settings size={20} />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Settings</h1>
          <p className="text-sm text-ink-muted">Manage your business information and website content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Business Information */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Business Information</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Business Name</label>
            <input name="business_name" value={form.business_name} onChange={handleChange} className={ic} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className={ic} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Business Hours</label>
            <input name="business_hours" value={form.business_hours} onChange={handleChange} className={ic} />
          </div>
        </div>

        {/* Delivery */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Delivery</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Default Delivery Fee</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">&#8358;</span>
              <input
                type="number"
                name="delivery_fee"
                value={form.delivery_fee}
                onChange={handleChange}
                className={ic + ' pl-8'}
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Social Media</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} className={ic} placeholder="https://instagram.com/bamzycakes" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Facebook</label>
              <input name="facebook" value={form.facebook} onChange={handleChange} className={ic} placeholder="https://facebook.com/bamzycakes" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">WhatsApp</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={ic} placeholder="2347033374470" />
            </div>
          </div>
        </div>

        {/* Brand Images */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Brand Images</h2>
          <p className="text-xs text-ink-muted">Upload photos for your homepage hero, CEO section, and logo. These images appear across the website.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <BrandImageUpload
              label="Hero Image"
              sublabel="Homepage banner"
              currentImage={form.hero_image}
              defaultPath="/uploads/brand/bakery-hero.jpg"
              onUpload={(url) => setForm((p) => ({ ...p, hero_image: url }))}
            />
            <BrandImageUpload
              label="CEO / Founder Photo"
              sublabel="About page"
              currentImage={form.ceo_image}
              defaultPath="/uploads/brand/ceo-bamzy.jpg"
              onUpload={(url) => setForm((p) => ({ ...p, ceo_image: url }))}
            />
          </div>
        </div>

        {/* ═══ ABOUT PAGE MANAGEMENT ═══ */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <div>
            <h2 className="font-heading text-lg font-semibold">About Page Content</h2>
            <p className="text-xs text-ink-muted mt-1">Edit what customers see on the About page (bamzycakes.com/about). Changes save to the database instantly.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Page Headline</label>
            <input name="about_headline" value={form.about_headline} onChange={handleChange} className={ic} placeholder="Our Story" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Page Subtitle</label>
            <input name="about_subtitle" value={form.about_subtitle} onChange={handleChange} className={ic} placeholder="A story of passion..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Founder / CEO Name</label>
              <input name="about_ceo_name" value={form.about_ceo_name} onChange={handleChange} className={ic} placeholder="OLADEJI ADEOLA AYOBAMI" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Title</label>
              <input name="about_ceo_title" value={form.about_ceo_title} onChange={handleChange} className={ic} placeholder="Founder & Head Baker" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Our Story (paragraphs separated by new lines)</label>
            <textarea name="about_story" value={form.about_story} onChange={handleChange} rows={6} className={tc}
              placeholder={"Bamzy Cakes & Confectionery was born from a simple idea...\n\nWhat started as baking cakes for friends and family..."} />
          </div>

          {/* Values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Values / What We Stand For</label>
              <button type="button" onClick={addValue}
                className="flex items-center gap-1 rounded-lg bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors">
                <Plus size={14} /> Add Value
              </button>
            </div>
            <div className="space-y-3">
              {form.about_values.map((val, i) => (
                <div key={i} className="rounded-lg border border-lilac-soft bg-gray-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase">Value {i + 1}</span>
                    {form.about_values.length > 1 && (
                      <button type="button" onClick={() => removeValue(i)} className="text-pink hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input value={val.title} onChange={(e) => updateValue(i, 'title', e.target.value)}
                    className={ic} placeholder="e.g. Made With Love" />
                  <textarea value={val.description} onChange={(e) => updateValue(i, 'description', e.target.value)}
                    rows={2} className={tc} placeholder="Description of this value..." />
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <AboutGalleryUpload
              images={form.about_gallery_images}
              onUpdate={(images) => setForm(p => ({ ...p, about_gallery_images: images }))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-card transition-all ${
            isSaving
              ? 'cursor-not-allowed bg-ink/30'
              : 'bg-brand-gradient hover:shadow-glow'
          }`}
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  )
}

function BrandImageUpload({ label, sublabel, currentImage, defaultPath, onUpload }) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)

  const displaySrc = getImgUrl(currentImage || defaultPath)

  async function handleUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    setUploading(true)
    try {
      const data = await apiUploadImage('brand', file)
      onUpload(data.imageUrl)
      showToast(`${label} uploaded! Click "Save Settings" to apply.`, 'success')
    } catch (err) {
      showToast(err.message || 'Upload failed. Please try again.', 'error')
    }
    setUploading(false)
  }

  return (
    <div className="rounded-xl border border-dashed border-lilac bg-lilac/5 p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <p className="mb-3 text-xs text-ink-muted">{sublabel}</p>
      {displaySrc ? (
        <img src={displaySrc} alt={label} className="mb-3 h-32 w-full rounded-lg object-cover" onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-lilac/10">
          <ImageIcon size={28} className="text-lilac/40" />
        </div>
      )}
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-lilac/10 px-4 py-2 text-xs font-semibold text-lilac-deep transition-colors hover:bg-lilac/20">
        <Upload size={14} />
        {uploading ? 'Uploading...' : 'Change Image'}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} disabled={uploading} />
      </label>
    </div>
  )
}

function AboutGalleryUpload({ images, onUpdate }) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  async function handleUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    setUploading(true)
    try {
      const data = await apiUploadImage('brand', file)
      onUpdate([...images, data.imageUrl])
      showToast('Gallery image added! Click "Save Settings" to apply.', 'success')
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    }
    setUploading(false)
  }

  function removeImage(index) {
    onUpdate(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-ink">About Page Gallery (optional images for the About section)</label>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 rounded-lg bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors">
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Add Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={getImgUrl(img)} alt={`Gallery ${i + 1}`} className="h-24 w-full rounded-lg object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 rounded-full bg-ink/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
