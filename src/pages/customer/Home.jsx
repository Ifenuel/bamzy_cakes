import HeroSection from '../../components/home/HeroSection.jsx'
import AvailableToday from '../../components/home/AvailableToday.jsx'
import FeaturedSections from '../../components/home/FeaturedSections.jsx'
import WhyChooseSection from '../../components/home/WhyChooseSection.jsx'
import ReviewsSection from '../../components/home/ReviewsSection.jsx'
import NewsletterSection from '../../components/home/NewsletterSection.jsx'
import FinalCTA from '../../components/home/FinalCTA.jsx'

export default function Home() {
  return (
    <>
      <HeroSection />
      <AvailableToday />
      <FeaturedSections />
      <WhyChooseSection />
      <ReviewsSection />
      <NewsletterSection />
      <FinalCTA />
    </>
  )
}
