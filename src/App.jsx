import ScrollToTop from './components/common/ScrollToTop.jsx'
import WhatsAppButton from './components/common/WhatsAppButton.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <AppRoutes />
      <WhatsAppButton />
    </ErrorBoundary>
  )
}