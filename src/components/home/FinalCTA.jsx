import Button from '../ui/Button.jsx'
import ScrollReveal from '../ui/ScrollReveal.jsx'

export default function FinalCTA() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal preset="scaleUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
            Ready?
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to make your day
            <br />
            <span className="text-gradient">a little sweeter?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            Order today&apos;s treats or let Bamzy take care of your next celebration.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button to="/shop" size="lg">
              Shop Today
            </Button>
            <Button to="/events" variant="outline" size="lg">
              Book An Event
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
