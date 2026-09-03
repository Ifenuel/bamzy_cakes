import ScrollToTop from './components/common/ScrollToTop.jsx'
import WhatsAppButton from './components/common/WhatsAppButton.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <WhatsAppButton />
    </>
  )
}