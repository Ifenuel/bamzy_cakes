import pool from '../config/db.js'
import { success } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'

export async function getDashboard(_req, res) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [ordersToday, revenueToday, pendingOrders, availableProducts, upcomingBookings, upcomingTrainings, recentOrders, customerCount] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1", [today]),
      pool.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(created_at) = $1 AND payment_status = 'successful'", [today]),
      pool.query("SELECT COUNT(*) FROM orders WHERE order_status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM products WHERE status = 'active' AND stock > 0"),
      pool.query("SELECT id, full_name as \"fullName\", event_type as \"eventType\", event_date as \"eventDate\", status FROM event_bookings WHERE event_date >= $1 ORDER BY event_date ASC LIMIT 5", [today]),
      pool.query("SELECT id, title, date, available_spaces as \"availableSpaces\", status as \"trainingStatus\" FROM trainings WHERE date >= $1 AND status = 'upcoming' ORDER BY date ASC LIMIT 5", [today]),
      pool.query("SELECT id, order_number as \"orderNumber\", customer_name as \"customerName\", total, order_status as \"orderStatus\", created_at as \"createdAt\" FROM orders ORDER BY created_at DESC LIMIT 10"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
    ])

    return success(res, {
      todayOrders: parseInt(ordersToday.rows[0].count),
      todayRevenue: parseFloat(revenueToday.rows[0].total),
      pendingOrders: parseInt(pendingOrders.rows[0].count),
      availableProducts: parseInt(availableProducts.rows[0].count),
      customerCount: parseInt(customerCount.rows[0].count),
      upcomingBookings: upcomingBookings.rows,
      upcomingTrainings: upcomingTrainings.rows,
      recentOrders: recentOrders.rows,
    })
  } catch (err) {
    return safeError(res, err, 'Failed to load dashboard', 500)
  }
}
