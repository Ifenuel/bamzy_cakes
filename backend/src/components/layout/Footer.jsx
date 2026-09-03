import { Link } from 'react-router-dom'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'

const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Shop Today', to: '/shop' },
      { label: 'Cakes', to: '/cakes' },
      { label: 'Pastries', to: '/shop?category=pastries' },
      { label: 'Tiger Nuts', to: '/shop?category=tiger-nuts' },
      { label: 'Drinks', to: '/shop?category=drinks' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Trainings', to: '/trainings' },
      { label: 'Events & Bookings', to: '/events' },
      { label: 'Custom Orders', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQs', to: '/faq' },
      { label: 'Delivery', to: '/delivery' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
]

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/bamzycakes', external: true },
  { label: 'Facebook', icon: Facebook, href: '#', external: false },
  { label: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/2347033374470', external: true },
]

export default function Footer() {
  return (
    <footer className="border-t border-lilac-soft/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <img src="/logo.jpg" alt="Bamzy Cakes & Confectionery" className="mb-3 h-14 w-auto sm:h-16" />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Beautifully crafted cakes, pastries, tiger nuts and treats, made with love in Nigeria.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map(({ label, icon: Icon, href, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac-soft/50 text-lilac-deep transition-colors hover:bg-pink-soft hover:text-pink"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-sm font-semibold text-ink">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink-muted transition-colors hover:text-pink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-lilac-soft/60 pt-6 text-center text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Bamzy Cakes & Confectionery. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
