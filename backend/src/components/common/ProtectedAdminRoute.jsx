import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'

/**
 * Protects all admin routes.
 * - Shows spinner while checking auth
 * - Redirects to /admin/login if not logged in
 * - Shows "Access Denied" if logged in but not admin
 */
export default function ProtectedAdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner label="Checking access..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Access Denied</h1>
          <p className="mt-2 text-ink-muted">You need admin privileges to view this page.</p>
          <div className="mt-6">
            <a href="/" className="rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card hover:shadow-glow">
              Go to Shop
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
