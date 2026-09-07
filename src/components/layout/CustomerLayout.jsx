import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--c-bg)' }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}