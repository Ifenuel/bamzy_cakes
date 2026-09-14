import PageContainer from './PageContainer.jsx'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, FileText } from 'lucide-react'

/**
 * Shared layout for legal pages (Terms & Conditions, Privacy Policy).
 * Modern, professional design in the Bamzy brand language: gradient hero,
 * sticky section index on desktop, numbered cards, highlight callouts.
 */
export default function LegalLayout({ kind = 'terms', title, description, updated, intro, sections, footerNote, crossLink }) {
  const isPrivacy = kind === 'privacy'
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-gradient-subtle">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-lilac/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-pink/10 blur-3xl" aria-hidden="true" />
        <PageContainer className="relative py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
              {isPrivacy ? <ShieldCheck size={26} className="text-pink" /> : <FileText size={26} className="text-pink" />}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-lilac-deep">Legal · Bamzy Cakes</p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-ink md:text-5xl md:leading-tight">{title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">{description}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-ink-muted shadow-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Last updated: {updated}
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Section index — sticky on desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-lilac-soft bg-lilac-soft/20 p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">On this page</p>
              <nav className="mt-3 space-y-1.5">
                {sections.map((s, i) => (
                  <a key={i} href={`#section-${i}`}
                    className="block text-xs font-medium text-ink-muted transition-colors hover:text-pink">
                    {s.short || s.title.replace(/^\d+\.\s*/, '')}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 max-w-3xl">
            {intro && (
              <div className="rounded-2xl border border-lilac-soft bg-gradient-to-br from-lilac/10 to-pink/5 p-6 md:p-8">
                <p className="text-[15px] leading-relaxed text-ink">{intro}</p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {sections.map((s, i) => (
                <div key={i} id={`section-${i}`} className="scroll-mt-24 rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs transition-shadow hover:shadow-soft md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-heading text-base font-bold text-ink md:text-lg">
                        {s.title.replace(/^\d+\.\s*/, '')}
                      </h2>
                      <div className="mt-2.5 space-y-3">
                        {(Array.isArray(s.content) ? s.content : [s.content]).map((para, j) => (
                          <p key={j} className="text-sm leading-relaxed text-ink-muted">{para}</p>
                        ))}
                        {s.points && (
                          <ul className="mt-1 space-y-1.5">
                            {s.points.map((pt, k) => (
                              <li key={k} className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acknowledgement */}
            {footerNote && (
              <div className="mt-8 rounded-2xl border border-lilac-soft bg-lilac/5 p-6 md:p-7">
                <p className="text-sm leading-relaxed text-ink-muted">{footerNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {crossLink && (
                <Link to={crossLink.to}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow">
                  {crossLink.label}
                </Link>
              )}
              <Link to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-lilac-soft bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-lilac">
                <ArrowLeft size={15} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
