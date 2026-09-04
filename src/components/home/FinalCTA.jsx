import Button from '../ui/Button.jsx'
import ScrollReveal from '../ui/ScrollReveal.jsx'

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      {/* Decorative gradient blobs */}
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-pink/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-lilac/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal preset="scaleUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-pink/80">
            Ready?
          </p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Ready to make your day
            <br />
            <span className="text-gradient">a little sweeter?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">
            Order today&apos;s treats or let Bamzy take care of your next celebration.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button to="/shop" size="lg">
              Shop Today
            </Button>
            <Button to="/events" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Book An Event
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
