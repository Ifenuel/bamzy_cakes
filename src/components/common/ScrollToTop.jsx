import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls the window to top on every route change. Mount once near the router root. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window.HTMLElement.prototype ? 'instant' : 'auto' })
  }, [pathname])

  return null
}