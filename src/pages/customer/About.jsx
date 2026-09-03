import { useState, useEffect } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { Heart, Award, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { getImgUrl, apiGetSettings, apiGetProducts, apiGetTrainings } from '../../utils/api.js'
import ScrollReveal from '../../components/ui/ScrollReveal.jsx'

const DEFAULT_VALUES = [
  { icon: Heart, title: 'Made With Love', desc: 'Every product is prepared with care, using family recipes and modern techniques.' },
  { icon: Award, title: 'Quality First', desc: 'We source the finest ingredients and never compromise on taste or presentation.' },
  { icon: Users, title: 'For Every Occasion', desc: 'From daily treats to grand celebrations, Bamzy has something for everyone.' },
]

const VALUE_ICONS = [Heart, Award, Users]

function CeoImage({ ceoImage }) {
  const [error, setError] = useState(false)
  const src = getImgUrl(ceoImage || '/uploads/brand/ceo-bamzy.jpg')
  if (src && !error) {
    return (
      <div className="overflow-hidden rounded-xl3 shadow-soft">
        <img src={src} alt="Founder and Head Baker" className="aspect-square w-full object-cover" onError={() => setError(true)} />
      </div>
    )
  }
  return (
    <div className="rounded-xl3 bg-brand-gradient-soft p-8 text-center">
      <span className="font-heading text-6xl text-pink">B</span>
      <p className="mt-2 font-heading text-xl font-semibold text-ink">Bamzy Cakes & Confectionery</p>
    </div>
  )
}

export default function About() {
  const [settings, setSettings] = useState(null)
  const [stats, setStats] = useState({ products: 0, trainings: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiGetSettings().catch(() => ({})),
      apiGetProducts().catch(() => []),
      apiGetTrainings().catch(() => []),
    ]).then(([settingsData, products, trainings]) => {
      setSettings(settingsData)
      setStats({
        products: products?.length || 0,
        trainings: trainings?.length || 0,
      })
      setIsLoading(false)
    })
  }, [])

  // Pull values from settings or use defaults
  const aboutValues = Array.isArray(settings?.about_values) && settings.about_values.length > 0
    ? settings.about_values.map((v, i) => ({
        icon: VALUE_ICONS[i % VALUE_ICONS.length],
        title: v.title || '',
        desc: v.description || '',
      }))
    : DEFAULT_VALUES

  // Pull story paragraphs from settings
  const headline = settings?.about_headline || 'Our Story'
  const subtitle = settings?.about_subtitle || 'A story of passion, flavour and Nigerian sweetness.'
  const ceoName = settings?.about_ceo_name || 'OLADEJI ADEOLA AYOBAMI'
  const ceoTitle = settings?.about_ceo_title || 'Founder & Head Baker'
  const storyText = settings?.about_story || ''
  const storyParagraphs = storyText
    ? storyText.split('\n').filter(p => p.trim())
    : [
        'Bamzy Cakes & Confectionery was born from a simple idea: everyone deserves delicious, beautifully made treats for life\'s sweetest moments.',
        'What started as baking cakes for friends and family has grown into a full-service confectionery brand, offering everything from daily snacks and pastries to custom celebration cakes and event catering.',
        'Based in Nigeria, we combine traditional Nigerian flavours with modern baking techniques to create treats that look as good as they taste.',
        'Whether you are ordering a box of small chops for a party, learning to bake in one of our training sessions, or celebrating a milestone with a custom cake, Bamzy is here to make your day a little sweeter.',
      ]

  // Gallery images from settings
  const galleryImages = Array.isArray(settings?.about_gallery_images) ? settings.about_gallery_images : []

  if (isLoading) {
    return (
      <Section>
        <PageContainer>
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
            <p className="mt-3 text-sm text-ink-muted">Loading...</p>
          </div>
        </PageContainer>
      </Section>
    )
  }

  return (
    <>
      <SEO title="About Us" description={`Meet Bamzy — ${subtitle}`} />

      {/* Hero */}
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">{headline}</h1>
            <p className="mt-3 text-ink-muted">{subtitle}</p>
          </div>
        </PageContainer>
      </Section>

      {/* CEO Story */}
      <Section>
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <ScrollReveal preset="fadeLeft">
              <CeoImage ceoImage={settings?.ceo_image} />
              <p className="mt-3 text-center text-sm font-semibold text-ink">{ceoName}</p>
              <p className="text-center text-xs text-ink-muted">{ceoTitle}</p>
            </ScrollReveal>
            <ScrollReveal preset="fadeRight" delay={0.1}>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">{headline}</h2>
              <div className="mt-4 space-y-3 text-ink-muted leading-relaxed">
                {storyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </PageContainer>
      </Section>

      {/* Gallery (if admin added images) */}
      {galleryImages.length > 0 && (
        <Section background="soft">
          <PageContainer>
            <ScrollReveal preset="fadeUp" className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Our Kitchen</h2>
            </ScrollReveal>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((img, i) => (
                <ScrollReveal key={i} preset="scaleUp" delay={i * 0.08}>
                  <div className="overflow-hidden rounded-xl shadow-soft">
                    <img src={getImgUrl(img)} alt={`Gallery ${i + 1}`}
                      className="h-40 w-full object-cover transition-transform duration-500 hover:scale-110" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </PageContainer>
        </Section>
      )}

      {/* Values */}
      <Section background={galleryImages.length > 0 ? undefined : 'soft'}>
        <PageContainer>
          <ScrollReveal preset="fadeUp" className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">What We Stand For</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {aboutValues.filter(v => v.title).map(({ icon: Icon, title, desc }, i) => (
              <ScrollReveal key={title} preset="fadeUp" delay={i * 0.1}>
                <div className="rounded-xl2 border border-lilac-soft bg-white p-6 text-center shadow-soft">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-soft text-pink">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-xs text-ink-muted">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Stats */}
      <Section>
        <PageContainer>
          <ScrollReveal preset="fadeUp" className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Why Customers Love Bamzy</h2>
            <p className="mt-3 text-ink-muted">From everyday cravings to special celebrations, we are here for you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="rounded-xl2 border border-lilac-soft bg-white px-6 py-4 shadow-soft">
                <p className="text-2xl font-bold text-pink">{stats.products || '—'}</p>
                <p className="text-xs text-ink-muted">Products</p>
              </div>
              <div className="rounded-xl2 border border-lilac-soft bg-white px-6 py-4 shadow-soft">
                <p className="text-2xl font-bold text-lilac-deep">{stats.trainings || '—'}</p>
                <p className="text-xs text-ink-muted">Training Classes</p>
              </div>
              <div className="rounded-xl2 border border-lilac-soft bg-white px-6 py-4 shadow-soft">
                <p className="text-2xl font-bold text-pink">6</p>
                <p className="text-xs text-ink-muted">Event Types</p>
              </div>
            </div>
          </ScrollReveal>
        </PageContainer>
      </Section>
    </>
  )
}
