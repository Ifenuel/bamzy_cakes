import { useState, useEffect, useRef } from 'react'
import { Settings, Save, Upload, Image as ImageIcon, Plus, Trash2, Star, X } from 'lucide-react'
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
    // Events page fields
    event_types: [],
    event_types_dropdown: [],
    event_services: [],
    // Featured sections for homepage
    featured_sections: [
      { title: 'Events & Catering', description: '', img: '' },
      { title: 'Baking Trainings', description: '', img: '' },
      { title: 'About Bamzy', description: '', img: '' },
    ],
    // Why Choose Bamzy
    why_choose_bamzy: [],
    events_hero_image: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
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
          // Events
          event_types: Array.isArray(settings.event_types) ? settings.event_types : [
            { title: 'Birthday Parties', desc: 'Custom cakes, small chops and full catering for unforgettable celebrations.', img: '' },
            { title: 'Weddings', desc: 'Beautiful wedding cakes, dessert tables and catering for your big day.', img: '' },
            { title: 'Bridal Showers', desc: 'Sweet treats and elegantly packaged pastries for the bride-to-be.', img: '' },
            { title: 'Baby Showers', desc: 'Adorable cakes and treats to welcome the newest arrival.', img: '' },
            { title: 'Corporate Events', desc: 'Professional catering for meetings, launches and company parties.', img: '' },
            { title: 'Private Celebrations', desc: 'Anniversaries, graduations and milestone moments deserve Bamzy treats.', img: '' },
          ],
          event_types_dropdown: Array.isArray(settings.event_types_dropdown) ? settings.event_types_dropdown : [
            { value: 'birthday', label: 'Birthday' },
            { value: 'wedding', label: 'Wedding' },
            { value: 'bridal_shower', label: 'Bridal Shower' },
            { value: 'baby_shower', label: 'Baby Shower' },
            { value: 'corporate', label: 'Corporate' },
            { value: 'private_event', label: 'Private Party' },
            { value: 'other', label: 'Other' },
          ],
          event_services: Array.isArray(settings.event_services) ? settings.event_services : ['Cakes', 'Small Chops', 'Pastries', 'Full Catering', 'Dessert Table', 'Event Setup', 'Tiger Nuts & Drinks'],
          events_hero_image: settings.events_hero_image || '',
          featured_sections: Array.isArray(settings.featured_sections) && settings.featured_sections.length > 0 ? settings.featured_sections : [
            { title: 'Events & Catering', description: 'Birthdays, weddings, outdoor events and celebrations — Bamzy has you covered.', img: '' },
            { title: 'Baking Trainings', description: 'Learn the art of baking with hands-on practical classes from our expert team.', img: '' },
            { title: 'About Bamzy', description: 'A story of passion, flavour and Nigerian sweetness — meet the woman behind the treats.', img: '' },
          ],
          why_choose_bamzy: Array.isArray(settings.why_choose_bamzy) && settings.why_choose_bamzy.length > 0 ? settings.why_choose_bamzy : [],
        })
        setIsLoading(false)
      })
      .catch((err) => {
        setLoadError(err.message || 'Failed to load settings')
        setIsLoading(false)
      })
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
        // Events
        event_types: form.event_types,
        event_types_dropdown: form.event_types_dropdown,
        event_services: form.event_services,
        events_hero_image: form.events_hero_image,
        featured_sections: form.featured_sections,
        why_choose_bamzy: form.why_choose_bamzy,
      })
       showToast('Settings saved!', 'success')
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

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-lg font-bold text-ink">Failed to load settings</p>
          <p className="mt-2 text-sm text-ink-muted">{loadError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white">Try Again</button>
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
          <h1 className="font-heading text-2xl font-bold text-ink">Settings</h1>           <p className="text-sm text-ink-muted">Update your business info, images, and website content.</p>
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
            <p className="text-xs text-ink-muted mt-1">Edit what customers see on the About page. Changes save immediately.</p>
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

        {/* ═══ EVENTS PAGE MANAGEMENT ═══ */}
        <div className="space-y-4 rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <div>
            <h2 className="font-heading text-lg font-semibold">Events Page Content</h2>
            <p className="text-xs text-ink-muted mt-1">Manage event types shown on the Events page and booking form.</p>
          </div>

          {/* Event Types (display cards on /events) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Event Types (shown on Events page)</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, event_types: [...p.event_types, { title: '', desc: '', img: '' }] }))}
                className="flex items-center gap-1 rounded-lg bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors">
                <Plus size={14} /> Add Event Type
              </button>
            </div>
            <div className="space-y-3">
              {form.event_types.map((et, i) => (
                <div key={i} className="rounded-lg border border-lilac-soft bg-gray-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase">Event {i + 1}</span>
                    {form.event_types.length > 1 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, event_types: p.event_types.filter((_, j) => j !== i) }))}
                        className="text-pink hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <input value={et.title} onChange={(e) => { const v = [...form.event_types]; v[i] = { ...v[i], title: e.target.value }; setForm(p => ({ ...p, event_types: v })) }}
                    className={ic} placeholder="e.g. Birthday Parties" />
                  <input value={et.desc} onChange={(e) => { const v = [...form.event_types]; v[i] = { ...v[i], desc: e.target.value }; setForm(p => ({ ...p, event_types: v })) }}
                    className={ic} placeholder="Description..." />
                  <div className="flex items-center gap-2">
                    <EventImageUpload label={`Event ${i + 1} Image`} currentImage={et.img}
                      onUpload={(url) => { const v = [...form.event_types]; v[i] = { ...v[i], img: url }; setForm(p => ({ ...p, event_types: v })) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Types Dropdown (for booking form) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Booking Form Dropdown Options</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, event_types_dropdown: [...p.event_types_dropdown, { value: '', label: '' }] }))}
                className="flex items-center gap-1 rounded-lg bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors">
                <Plus size={14} /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {form.event_types_dropdown.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={opt.value} onChange={(e) => { const v = [...form.event_types_dropdown]; v[i] = { ...v[i], value: e.target.value }; setForm(p => ({ ...p, event_types_dropdown: v })) }}
                    className={ic} placeholder="value (e.g. birthday)" style={{ flex: 1 }} />
                  <input value={opt.label} onChange={(e) => { const v = [...form.event_types_dropdown]; v[i] = { ...v[i], label: e.target.value }; setForm(p => ({ ...p, event_types_dropdown: v })) }}
                    className={ic} placeholder="Label (e.g. Birthday)" style={{ flex: 1 }} />
                  {form.event_types_dropdown.length > 1 && (
                    <button type="button" onClick={() => setForm(p => ({ ...p, event_types_dropdown: p.event_types_dropdown.filter((_, j) => j !== i) }))}
                      className="text-pink hover:text-red-500"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Services */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Booking Form Services (comma separated)</label>
            <input value={form.event_services.join(', ')} onChange={(e) => setForm(p => ({ ...p, event_services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              className={ic} placeholder="Cakes, Small Chops, Pastries..." />
          </div>

          {/* Events Hero Image */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Events Page Hero Image</label>
            <EventImageUpload label="Events Hero" currentImage={form.events_hero_image}
              onUpload={(url) => setForm(p => ({ ...p, events_hero_image: url }))} />
          </div>
        </div>

        {/* ─── Featured Sections (Homepage) ─── */}
        <div className="rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-lilac" />
            <h3 className="font-heading text-base font-semibold text-ink">Homepage Featured Sections</h3>
          </div>
          <p className="mb-3 text-xs text-ink-muted">These appear on the homepage &ldquo;What are you looking for?&rdquo; section. Upload images for each card.</p>
          <div className="space-y-4">
            {(form.featured_sections || []).map((sec, i) => (
              <div key={i} className="rounded-lg border border-lilac-soft/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Card {i + 1}</span>
                </div>
                <input value={sec.title} onChange={(e) => setForm(p => {
                  const fs = [...p.featured_sections]
                  fs[i] = { ...fs[i], title: e.target.value }
                  return { ...p, featured_sections: fs }
                })} className={ic} placeholder="Section title" />
                <input value={sec.description} onChange={(e) => setForm(p => {
                  const fs = [...p.featured_sections]
                  fs[i] = { ...fs[i], description: e.target.value }
                  return { ...p, featured_sections: fs }
                })} className={ic} placeholder="Short description" />
                <EventImageUpload label={sec.title} currentImage={sec.img}
                  onUpload={(url) => setForm(p => {
                    const fs = [...p.featured_sections]
                    fs[i] = { ...fs[i], img: url }
                    return { ...p, featured_sections: fs }
                  })} />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Why Choose Bamzy ─── */}
        <div className="rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-lilac" />
              <h3 className="font-heading text-base font-semibold text-ink">Why Choose Bamzy</h3>
            </div>
            <button type="button" onClick={() => setForm(p => ({ ...p, why_choose_bamzy: [...(p.why_choose_bamzy || []), { title: '', description: '' }] }))}
              className="text-xs font-medium text-pink hover:underline">+ Add benefit</button>
          </div>
          <p className="mb-3 text-xs text-ink-muted">These appear as the numbered list on the homepage &ldquo;Why Choose Bamzy?&rdquo; section.</p>
          <div className="space-y-3">
            {(form.why_choose_bamzy || []).map((b, i) => (
              <div key={i} className="flex gap-2 items-start rounded-lg border border-lilac-soft/60 p-3">
                <span className="mt-2 text-sm font-bold text-lilac">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 space-y-2">
                  <input value={b.title} onChange={(e) => setForm(p => {
                    const w = [...p.why_choose_bamzy]
                    w[i] = { ...w[i], title: e.target.value }
                    return { ...p, why_choose_bamzy: w }
                  })} className={ic} placeholder="Benefit title (e.g. Freshly Made)" />
                  <textarea value={b.description} onChange={(e) => setForm(p => {
                    const w = [...p.why_choose_bamzy]
                    w[i] = { ...w[i], description: e.target.value }
                    return { ...p, why_choose_bamzy: w }
                  })} rows={2} className={ic + ' resize-none'} placeholder="Short description" />
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, why_choose_bamzy: p.why_choose_bamzy.filter((_, j) => j !== i) }))}
                  className="mt-2 rounded p-1 text-ink-muted hover:bg-error-soft hover:text-error"><X size={14} /></button>
              </div>
            ))}
            {(!form.why_choose_bamzy || form.why_choose_bamzy.length === 0) && (
              <p className="py-4 text-center text-xs text-ink-muted">No benefits added yet. Click &ldquo;Add benefit&rdquo; above.</p>
            )}
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
          ))}          </div>
        )}
    </div>
  )
}

function EventImageUpload({ label, currentImage, onUpload }) {
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
      const data = await apiUploadImage('events', file)
      onUpload(data.imageUrl)
      showToast('Image uploaded! Click "Save Settings" to apply.', 'success')
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-3">
      {currentImage ? (
        <img src={getImgUrl(currentImage)} alt={label} className="h-16 w-16 rounded-lg object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-lilac/10">
          <ImageIcon size={20} className="text-lilac/40" />
        </div>
      )}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-lilac/10 px-4 py-2 text-xs font-semibold text-lilac-deep transition-colors hover:bg-lilac/20">
        <Upload size={14} />
        {uploading ? 'Uploading...' : (currentImage ? 'Change' : 'Upload Image')}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} disabled={uploading} />
      </label>
    </div>
  )
}
