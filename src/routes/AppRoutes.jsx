import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import CustomerLayout from '../components/layout/CustomerLayout.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import ProtectedAdminRoute from '../components/common/ProtectedAdminRoute.jsx'

/* ── Customer Pages (lazy loaded) ──────────────────────── */
const Home = lazy(() => import('../pages/customer/Home.jsx'))
const ShopToday = lazy(() => import('../pages/customer/ShopToday.jsx'))
const ProductDetails = lazy(() => import('../pages/customer/ProductDetails.jsx'))
const Cart = lazy(() => import('../pages/customer/Cart.jsx'))
const Checkout = lazy(() => import('../pages/customer/Checkout.jsx'))
const OrderConfirmation = lazy(() => import('../pages/customer/OrderConfirmation.jsx'))
const Cakes = lazy(() => import('../pages/customer/Cakes.jsx'))
const Trainings = lazy(() => import('../pages/customer/Trainings.jsx'))
const TrainingDetails = lazy(() => import('../pages/customer/TrainingDetails.jsx'))
const Events = lazy(() => import('../pages/customer/Events.jsx'))
const EventsBook = lazy(() => import('../pages/customer/EventsBook.jsx'))
const About = lazy(() => import('../pages/customer/About.jsx'))
const Contact = lazy(() => import('../pages/customer/Contact.jsx'))
const Account = lazy(() => import('../pages/customer/Account.jsx'))
const Login = lazy(() => import('../pages/customer/Login.jsx'))
const Register = lazy(() => import('../pages/customer/Register.jsx'))
const ForgotPassword = lazy(() => import('../pages/customer/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('../pages/customer/ResetPassword.jsx'))
const VerifyEmail = lazy(() => import('../pages/customer/VerifyEmail.jsx'))
const NotFound = lazy(() => import('../pages/customer/NotFound.jsx'))
const FAQ = lazy(() => import('../pages/customer/FAQ.jsx'))
const PrivacyPolicy = lazy(() => import('../pages/customer/PrivacyPolicy.jsx'))
const Delivery = lazy(() => import('../pages/customer/Delivery.jsx'))
const Terms = lazy(() => import('../pages/customer/Terms.jsx'))

/* ── Admin Pages (lazy loaded) ─────────────────────────── */
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin.jsx'))
const AdminRegister = lazy(() => import('../pages/admin/AdminRegister.jsx'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'))
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts.jsx'))
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders.jsx'))
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings.jsx'))
const AdminTrainings = lazy(() => import('../pages/admin/AdminTrainings.jsx'))
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers.jsx'))
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments.jsx'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings.jsx'))
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics.jsx'))
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories.jsx'))
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews.jsx'))
const AdminNewsletter = lazy(() => import('../pages/admin/AdminNewsletter.jsx'))
const AdminDeliveryZones = lazy(() => import('../pages/admin/AdminDeliveryZones.jsx'))
const AdminFAQ = lazy(() => import('../pages/admin/AdminFAQ.jsx'))

/* ── Loading fallback ──────────────────────────────────── */
function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
        <p className="mt-3 text-sm text-ink-muted">Loading...</p>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth pages — full-page layout, no navbar/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Admin login (no layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopToday />} />
          <Route path="/shop/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderConfirmation />} />
          <Route path="/cakes" element={<Cakes />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/trainings/:trainingId" element={<TrainingDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/book" element={<EventsBook />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes (double-protected: route guard + layout) */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="trainings" element={<AdminTrainings />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="delivery-zones" element={<AdminDeliveryZones />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
