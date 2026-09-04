const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Base URL for static assets (uploads) — strips /api suffix
const BASE_URL = API_URL.replace(/\/api\/?$/, '')

/**
 * Build a full URL for uploaded images.
 * @param {string|null} path - e.g. "/uploads/products/chicken-pie.jpg"
 * @returns {string} full URL or empty string
 */
export function getImgUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return BASE_URL + path
}

async function request(path, options = {}) {
  const token = localStorage.getItem('bamzy_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000),
    })
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new Error('Request timed out. Please check your internet connection.')
    }
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please check that the backend is running.')
    }
    throw new Error('Network error. Please check your internet connection.')
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server returned an invalid response (HTTP ${res.status}). The server may be restarting.`)
  }

  if (!res.ok) {
    throw new Error(data.message || `Server error (${res.status})`)
  }

  return data.data
}

// Auth
export async function apiRegister(body) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiRegisterAdmin(body) {
  return request('/auth/admin/register', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiLogin(body) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiGetMe() {
  return request('/auth/me')
}

export async function apiForgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

export async function apiResetPassword(token, password) {
  return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
}

export async function apiVerifyEmail(token) {
  return request('/auth/verify-email?token=' + encodeURIComponent(token))
}

export async function apiResendVerification(email) {
  return request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
}

// OTP Verification
export async function apiSendOtp(email, full_name) {
  return request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email, full_name }) })
}

export async function apiVerifyOtp(email, code) {
  return request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code }) })
}

export async function apiResendOtp(email, full_name) {
  return request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email, full_name }) })
}

export async function apiUpdateProfile(body) {
  return request('/auth/me', { method: 'PUT', body: JSON.stringify(body) })
}

// Products
export async function apiGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/products${qs ? '?' + qs : ''}`)
}

export async function apiGetProductById(id) {
  return request(`/products/${id}`)
}

export async function apiCreateProduct(body) {
  return request('/products', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateProduct(id, body) {
  return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDeleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

export async function apiGetCategories() {
  return request('/products/categories')
}

export async function apiCreateCategory(body) {
  return request('/products/categories', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateCategory(id, body) {
  return request('/products/categories/' + id, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDeleteCategory(id) {
  return request('/products/categories/' + id, { method: 'DELETE' })
}

// Product Images
export async function apiGetProductImages(productId) {
  return request('/product-images/' + productId)
}

export async function apiUploadProductImage(productId, file) {
  const token = localStorage.getItem('bamzy_token')
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(API_URL + '/product-images/' + productId, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.data
}

export async function apiSetPrimaryImage(productId, imageId) {
  return request('/product-images/' + productId + '/' + imageId + '/primary', { method: 'PATCH' })
}

export async function apiDeleteProductImage(productId, imageId) {
  return request('/product-images/' + productId + '/' + imageId, { method: 'DELETE' })
}

// Orders
export async function apiCreateOrder(body) {
  return request('/orders', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiGetMyOrders() {
  return request('/orders')
}

export async function apiGetOrderById(id, email) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : ''
  return request(`/orders/${id}${qs}`)
}

export async function apiGetAllOrders(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/orders/admin/all${qs ? '?' + qs : ''}`)
}

export async function apiUpdateOrderStatus(id, order_status) {
  return request(`/orders/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ order_status }) })
}

// Bookings
export async function apiCreateBooking(body) {
  return request('/bookings', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiGetBookingById(id) {
  return request(`/bookings/${id}`)
}

export async function apiGetAllBookings(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/bookings/admin/all${qs ? '?' + qs : ''}`)
}

export async function apiUpdateBookingStatus(id, status) {
  return request(`/bookings/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// Trainings
export async function apiGetTrainings(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/trainings${qs ? '?' + qs : ''}`)
}

export async function apiGetTrainingById(id) {
  return request(`/trainings/${id}`)
}

export async function apiCreateTraining(body) {
  return request('/trainings', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateTraining(id, body) {
  return request(`/trainings/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDeleteTraining(id) {
  return request(`/trainings/${id}`, { method: 'DELETE' })
}

export async function apiRegisterForTraining(id, body) {
  return request(`/trainings/${id}/register`, { method: 'POST', body: JSON.stringify(body) })
}

// Account
export async function apiGetAccount() {
  return request('/customers')
}

export async function apiUpdateAccount(body) {
  return request('/customers', { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDeleteAccount(reason) {
  return request('/customers', { method: 'DELETE', body: JSON.stringify({ reason }) })
}

export async function apiGetNotifications() {
  return request('/customers/notifications')
}

export async function apiMarkNotificationRead(id) {
  return request('/customers/notifications/' + id + '/read', { method: 'PUT' })
}

export async function apiMarkAllNotificationsRead() {
  return request('/customers/notifications/read-all', { method: 'PUT' })
}

// Admin
export async function apiGetDashboard() {
  return request('/admin/dashboard')
}

export async function apiGetCustomers() {
  return request('/admin/customers')
}

export async function apiGetAdminActivity(limit = 20) {
  return request('/admin/activity?limit=' + limit)
}

export async function apiGetAdminReport(period = 'daily', date) {
  const params = new URLSearchParams({ period })
  if (date) params.set('date', date)
  return request('/admin/report?' + params.toString())
}

// Payments
export async function apiGetPayments() {
  return request('/payments')
}

// Contact
export async function apiSendContact(body) {
  return request('/contact', { method: 'POST', body: JSON.stringify(body) })
}

// Wishlist
export async function apiGetWishlist() {
  return request('/customers/wishlist')
}

export async function apiAddToWishlist(productId) {
  return request('/customers/wishlist/' + productId, { method: 'POST' })
}

export async function apiRemoveFromWishlist(productId) {
  return request('/customers/wishlist/' + productId, { method: 'DELETE' })
}

export async function apiCheckWishlist(productId) {
  return request('/customers/wishlist/check/' + productId)
}

// Payments (Paystack)
export async function apiInitializePayment(body) {
  return request('/payments/initialize', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiVerifyPayment(reference) {
  return request('/payments/verify/' + reference)
}

export async function apiGetPaymentStatus(reference) {
  return request('/payments/status/' + reference)
}

// Upload
export async function apiUploadImage(type, file) {
  const token = localStorage.getItem('bamzy_token')
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(API_URL + '/upload/' + type, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.data
}

export async function apiUploadAvatar(file) {
  const token = localStorage.getItem('bamzy_token')
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(API_URL + '/upload/avatar', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.data
}

// Analytics
export async function apiTrackEvent(eventName, metadata = {}) {
  try {
    const sessionId = localStorage.getItem('bamzy_session') || (() => {
      const id = crypto.randomUUID()
      localStorage.setItem('bamzy_session', id)
      return id
    })()
    await request('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ event_name: eventName, session_id: sessionId, metadata }),
    })
  } catch {
    // Silent fail — analytics should never block the user
  }
}

export async function apiGetAnalyticsOverview(days = 30) {
  return request('/analytics/admin/overview?days=' + days)
}

export async function apiGetRevenueAnalytics(days = 30) {
  return request('/analytics/admin/revenue?days=' + days)
}

export async function apiGetProductAnalytics(days = 30) {
  return request('/analytics/admin/products?days=' + days)
}

export async function apiGetOrderAnalytics(days = 30) {
  return request('/analytics/admin/orders?days=' + days)
}

export async function apiGetCustomerAnalytics(days = 30) {
  return request('/analytics/admin/customers?days=' + days)
}

export async function apiGetBookingAnalytics() {
  return request('/analytics/admin/bookings')
}

export async function apiGetTrainingAnalytics() {
  return request('/analytics/admin/trainings')
}

// Reviews
export async function apiGetSettings() {
  return request('/settings')
}

export async function apiUpdateSettings(body) {
  return request('/settings', { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiGetReviews() {
  return request('/reviews')
}

export async function apiSubmitReview(body) {
  return request('/reviews', { method: 'POST', body: JSON.stringify(body) })
}

// Newsletter
export async function apiSubscribeNewsletter(email, full_name) {
  return request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, full_name }) })
}

export async function apiGetNewsletterStats() {
  return request('/newsletter/admin/subscribers')
}

// Delivery zones
export async function apiGetDeliveryZones() {
  return request('/delivery-zones')
}

export async function apiCalculateDeliveryFee(city, state) {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  if (state) params.set('state', state)
  return request('/delivery-zones/calculate?' + params.toString())
}

// Admin delivery zone management
export async function apiGetAdminDeliveryZones() {
  return request('/delivery-zones/admin/all')
}

export async function apiCreateDeliveryZone(body) {
  return request('/delivery-zones/admin', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateDeliveryZone(id, body) {
  return request('/delivery-zones/admin/' + id, { method: 'PUT', body: JSON.stringify(body) })
}

export async function apiDeleteDeliveryZone(id) {
  return request('/delivery-zones/admin/' + id, { method: 'DELETE' })
}
