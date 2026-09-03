import { useState, useEffect } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { CalendarHeart } from 'lucide-react'
import { motion } from 'framer-motion'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import { getImgUrl, apiGetSettings } from '../../utils/api.js'

const DEFAULT_EVENT_TYPES = [
  { title: 'Birthday Parties', desc: 'Custom cakes, small chops and full catering for unforgettable celebrations.', img: '' },
  { title: 'Weddings', desc: 'Beautiful wedding cakes, dessert tables and catering for your big day.', img: '' },
  { title: 'Bridal Showers', desc: 'Sweet treats and elegantly packaged pastries for the bride-to-be.', img: '' },
  { title: 'Baby Showers', desc: 'Adorable cakes and treats to welcome the newest arrival.', img: '' },
  { title: 'Corporate Events', desc: 'Professional catering for meetings, launches and company parties.', img: '' },
  { title: 'Private Celebrations', desc: 'Anniversaries, graduations and milestone moments deserve Bamzy treats.', img: '' },
]

function EventCardImage({ src, alt }) {
  const [imgError, setImgError] = useState(false)
  if (src && !imgError) {
    return <img src={getImgUrl(src)} alt={alt} className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setImgError(true)} />
  }
  return (
    <div className="upload-placeholder h-48 w-full">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-lilac/40">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="text-[10px] font-medium text-lilac/50">No image uploaded</span>
    </div>
  )
}

export default function Events() {
  const [eventTypes, setEventTypes] = useState(DEFAULT_EVENT_TYPES)
  const [heroImage, setHeroImage] = useState('')

  useEffect(() => {
    apiGetSettings().then((settings) => {
      if (Array.isArray(settings?.event_types) && settings.event_types.length > 0) {
        setEventTypes(settings.event_types)
      }
      if (settings?.events_hero_image) {
        setHeroImage(settings.events_hero_image)
      }
    }).catch(() => {})
  }, [])

  return (
    <>
      <SEO title="Events & Bookings" description="Book Bamzy for your next event — birthdays, weddings, bridal showers, corporate events. Professional catering across Southwest Nigeria." />
      <section className="bg-brand-gradient-soft py-10 sm:py-14">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <CalendarHeart size={24} />
            </span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Events & Bookings</h1>
              <p className="mt-1 text-ink-muted">Let Bamzy make your event delicious and memorable.</p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What We Can Cater</h2>
            <p className="mt-3 text-ink-muted">From intimate gatherings to grand celebrations, we have you covered.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes.filter(e => e.title).map(({ title, desc, img }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="group h-full overflow-hidden rounded-xl border border-lilac-soft bg-white shadow-soft transition-shadow hover:shadow-card">
                  <EventCardImage src={img} alt={title} />
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:items-center">
            {heroImage ? (
              <div className="overflow-hidden rounded-xl shadow-soft">
                <img src={getImgUrl(heroImage)} alt="Bamzy event catering" className="h-64 w-full object-cover sm:h-80" />
              </div>
            ) : (
              <div className="upload-placeholder h-64 w-full rounded-xl sm:h-80">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-lilac/40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs text-lilac/50">No image uploaded</span>
              </div>
            )}
            <div className="rounded-xl border border-lilac-soft bg-brand-gradient-soft p-8">
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">Ready to Book?</h2>
              <p className="mt-3 text-ink-muted">Tell us about your event and we will create something special for you.</p>
              <div className="mt-6">
                <Button to="/events/book" size="lg">Book an Event</Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  )
}
