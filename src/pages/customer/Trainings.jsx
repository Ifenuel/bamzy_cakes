import { useState, useEffect } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { Link } from 'react-router-dom'
import { GraduationCap, Calendar, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import ImagePlaceholder from '../../components/common/ImagePlaceholder.jsx'
import { apiGetTrainings } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

function TrainingImage({ title, imageUrl }) {
  const [error, setError] = useState(false)
  if (imageUrl && !error) {
    return <img src={getImgUrl(imageUrl)} alt={title} className="h-48 w-full object-cover" onError={() => setError(true)} />
  }
  return <ImagePlaceholder label={title} className="h-48 w-full" iconSize={32} />
}

export default function Trainings() {
  const [trainings, setTrainings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ok = true
    apiGetTrainings().then((d) => { if (ok) { setTrainings(d); setIsLoading(false) } })
    return () => { ok = false }
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <SEO title="Trainings" description="Learn to bake with Bamzy — cake decorating, small chops, baking basics. Hands-on training in Ibadan." />
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft"><GraduationCap size={24} /></span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Learn With Bamzy</h1>
              <p className="mt-1 text-ink-muted">Hands-on baking and cooking classes led by our expert team.</p>
            </div>
          </div>
        </PageContainer>
      </Section>
      <Section className="pt-8 pb-14 sm:pt-10 sm:pb-20">
        <PageContainer>
          {isLoading ? <LoadingSpinner label="Loading trainings..." /> : trainings.length === 0 ? (
            <div className="py-16 text-center"><p className="text-lg text-ink-muted">No trainings available right now. Check back soon!</p></div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {trainings.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={'/trainings/' + t.id} className="block overflow-hidden rounded-xl2 border border-lilac-soft bg-white shadow-soft transition-shadow hover:shadow-card">
                    <TrainingImage title={t.title} imageUrl={t.imageUrl} />
                    <div className="p-5">
                      <h3 className="font-heading text-xl font-bold text-ink">{t.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{t.description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(t.date)}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {t.availableSpaces} spots left</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-pink">{formatNaira(t.price)}</span>
                        <span className="rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">View Details</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </PageContainer>
      </Section>
    </>
  )
}
