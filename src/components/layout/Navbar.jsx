import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, ShoppingBag, User, LogOut, ChevronRight } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import SearchOverlay from '../common/SearchOverlay.jsx'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop Today', to: '/shop' },
  { label: 'Cakes', to: '/cakes' },
  { label: 'Trainings', to: '/trainings' },
  { label: 'Events & Bookings', to: '/events' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Delivery', to: '/delivery' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { getItemCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const itemCount = getItemCount()
  const sidebarRef = useRef(null)

  useEffect(() => {
    function onScroll() { setIsScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false) }, [location.pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isMenuOpen])

  function handleLogout() {
    setIsMenuOpen(false)
    logout()
    window.location.href = '/'
  }

  const firstName = user?.full_name?.split(' ')[0] || ''

  return (
    <>
      {/* ── Header ── */}
      <header
        style={{
          boxShadow: isScrolled ? '0 4px 30px -4px rgba(111,74,168,0.12)' : 'none',
          backgroundColor: isScrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          transition: 'all 0.3s ease',
        }}
        className="sticky top-0 z-40 border-b border-lilac-soft/40 backdrop-blur-md"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Bamzy Cakes & Confectionery home">
            <img
              src="/logo.jpg"
              alt="Bamzy Cakes & Confectionery"
              className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full object-cover ring-2 ring-lilac-soft/50 transition-transform hover:scale-105"
            />
            <div className="hidden sm:block">
              <p className="font-heading text-base sm:text-lg lg:text-xl font-bold leading-tight text-ink">Bamzy Cakes</p>
              <p className="text-[10px] sm:text-xs text-ink-muted leading-tight">& Confectionery</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-lilac-soft/60 hover:text-pink"
            >
              <Search size={20} />
            </button>

            <Link to="/cart" aria-label={'Cart, ' + itemCount + ' items'}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-lilac-soft/60 hover:text-pink">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link to={isAuthenticated ? '/account' : '/login'}
              aria-label={isAuthenticated ? 'My account' : 'Sign in'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-lilac-soft/60 hover:text-pink">
              {isAuthenticated && user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-lilac-soft" />
              ) : isAuthenticated ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={20} />
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-lilac-soft/60"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
        style={{
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
      />

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-lilac-soft/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Bamzy" className="h-10 w-10 rounded-full object-cover ring-2 ring-lilac-soft/50" />
            <div>
              <p className="font-heading text-sm font-bold leading-tight text-ink">Bamzy</p>
              <p className="text-[10px] text-ink-muted leading-tight">Cakes & Confectionery</p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-lilac-soft/60 hover:text-pink"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info */}
        {isAuthenticated && (
          <div className="border-b border-lilac-soft/60 px-5 py-4">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-lilac-soft" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink truncate">{user?.full_name}</p>
                <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ' +
                  (isActive
                    ? 'bg-brand-gradient text-white shadow-card'
                    : 'text-ink hover:bg-lilac-soft/60 hover:text-pink')
                }
              >
                {link.label}
                <ChevronRight size={16} className="opacity-50" />
              </NavLink>
            ))}
          </div>

          {/* Account section */}
          <div className="mt-6 border-t border-lilac-soft/60 pt-4">
            {isAuthenticated ? (
              <div className="space-y-1">
                <NavLink
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ' +
                    (isActive ? 'bg-pink-soft text-pink' : 'text-ink hover:bg-lilac-soft/60 hover:text-pink')
                  }
                >
                  My Bamzy
                  <ChevronRight size={16} className="opacity-50" />
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-error-soft"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-card"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full border border-lilac-soft px-5 py-3 text-sm font-medium text-ink hover:bg-lilac-soft/60"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom action */}
        <div className="border-t border-lilac-soft/60 px-5 py-4">
          <Link
            to="/shop"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center justify-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-card"
          >
            Shop Today&apos;s Treats
          </Link>
        </div>
      </aside>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
