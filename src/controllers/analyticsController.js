import pool from '../config/db.js'

export async function trackEvent(req, res) {
  try {
    const { event_name, session_id, metadata } = req.body
    const user_id = req.user?.id || null

    await pool.query(
      'INSERT INTO analytics_events (event_name, user_id, session_id, metadata) VALUES ($1, $2, $3, $4)',
      [event_name, user_id, session_id || null, JSON.stringify(metadata || {})]
    )

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to track event' })
  }
}

export async function getAnalyticsOverview(req, res) {
  try {
    const days = parseInt(req.query.days) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [totalOrders, totalRevenue, totalCustomers, totalProducts, pendingOrders, recentOrders, totalBookings, totalTrainings] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders WHERE created_at >= $1', [startDate]),
      pool.query('SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = $1 AND created_at >= $2', ['successful', startDate]),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND created_at >= $1", [startDate]),
      pool.query("SELECT COUNT(*) as count FROM products WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'"),
      pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10'),
      pool.query('SELECT COUNT(*) as count FROM event_bookings WHERE created_at >= $1', [startDate]),
      pool.query('SELECT COUNT(*) as count FROM training_registrations WHERE created_at >= $1', [startDate]),
    ])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todayOrders, todayRevenue] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders WHERE created_at >= $1', [todayStart]),
      pool.query("SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = 'successful' AND created_at >= $1", [todayStart]),
    ])

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrders.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].sum),
        totalCustomers: parseInt(totalCustomers.rows[0].count),
        totalProducts: parseInt(totalProducts.rows[0].count),
        pendingOrders: parseInt(pendingOrders.rows[0].count),
        todayOrders: parseInt(todayOrders.rows[0].count),
        todayRevenue: parseFloat(todayRevenue.rows[0].sum),
        totalBookings: parseInt(totalBookings.rows[0].count),
        totalTrainings: parseInt(totalTrainings.rows[0].count),
        recentOrders: recentOrders.rows.map(formatOrder),
      },
    })
  } catch (err) {
    console.error('Analytics overview error:', err)
    res.status(500).json({ success: false, message: 'Failed to load analytics' })
  }
}

export async function getRevenueAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE payment_status = 'successful' AND created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate])

    res.json({
      success: true,
      data: result.rows.map(r => ({
        date: r.date,
        orders: parseInt(r.order_count),
        revenue: parseFloat(r.revenue),
      })),
    })
  } catch (err) {
    console.error('Revenue analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load revenue data' })
  }
}

export async function getProductAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [bestSelling, categoryPerformance, inventory] = await Promise.all([
      pool.query(`
        SELECT 
          p.name,
          p.id,
          c.slug as category,
          SUM(oi.quantity) as units_sold,
          SUM(oi.quantity * oi.unit_price) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE o.payment_status = 'successful' AND o.created_at >= $1
        GROUP BY p.id, p.name, c.slug
        ORDER BY units_sold DESC
        LIMIT 10
      `, [startDate]),
      pool.query(`
        SELECT 
          c.slug as category,
          c.label as category_label,
          COUNT(DISTINCT o.id) as order_count,
          SUM(oi.quantity) as units_sold,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE o.payment_status = 'successful' AND o.created_at >= $1
        GROUP BY c.slug, c.label
        ORDER BY revenue DESC
      `, [startDate]),
      pool.query(`
        SELECT 
          p.name,
          p.stock,
          p.status,
          c.slug as category
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.stock ASC
      `),
    ])

    res.json({
      success: true,
      data: {
        bestSelling: bestSelling.rows.map(r => ({
          name: r.name,
          id: r.id,
          category: r.category,
          unitsSold: parseInt(r.units_sold),
          revenue: parseFloat(r.revenue),
        })),
        categoryPerformance: categoryPerformance.rows.map(r => ({
          category: r.category,
          categoryLabel: r.category_label,
          orderCount: parseInt(r.order_count),
          unitsSold: parseInt(r.units_sold),
          revenue: parseFloat(r.revenue),
        })),
        inventory: inventory.rows.map(r => ({
          name: r.name,
          stock: r.stock,
          status: r.status,
          category: r.category,
          isLowStock: r.stock > 0 && r.stock <= 5,
          isSoldOut: r.stock === 0,
        })),
      },
    })
  } catch (err) {
    console.error('Product analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load product analytics' })
  }
}

export async function getOrderAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [statusBreakdown, avgOrderValue, ordersByDay, fulfillmentRate] = await Promise.all([
      pool.query(`
        SELECT order_status, COUNT(*) as count
        FROM orders
        WHERE created_at >= $1
        GROUP BY order_status
      `, [startDate]),
      pool.query(`
        SELECT COALESCE(AVG(total), 0) as avg_value
        FROM orders
        WHERE payment_status = 'successful' AND created_at >= $1
      `, [startDate]),
      pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM orders
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate]),
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE order_status = 'completed') as completed,
          COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled,
          COUNT(*) FILTER (WHERE order_status = 'pending') as pending
        FROM orders
        WHERE created_at >= $1
      `, [startDate]),
    ])

    const fr = fulfillmentRate.rows[0]
    const total = parseInt(fr.total)

    res.json({
      success: true,
      data: {
        statusBreakdown: statusBreakdown.rows.map(r => ({
          status: r.order_status,
          count: parseInt(r.count),
        })),
        avgOrderValue: parseFloat(avgOrderValue.rows[0].avg_value),
        ordersByDay: ordersByDay.rows.map(r => ({
          date: r.date,
          count: parseInt(r.count),
        })),
        fulfillment: {
          total,
          completed: parseInt(fr.completed),
          cancelled: parseInt(fr.cancelled),
          pending: parseInt(fr.pending),
          rate: total > 0 ? Math.round((parseInt(fr.completed) / total) * 100) : 0,
        },
      },
    })
  } catch (err) {
    console.error('Order analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load order analytics' })
  }
}

export async function getCustomerAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [totalCustomers, newCustomers, topCustomers, customerGrowth] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND created_at >= $1", [startDate]),
      pool.query(`
        SELECT 
          u.full_name,
          u.email,
          COUNT(o.id) as order_count,
          COALESCE(SUM(o.total), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON o.customer_id = u.id AND o.payment_status = 'successful'
        WHERE u.role = 'customer'
        GROUP BY u.id, u.full_name, u.email
        ORDER BY total_spent DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE role = 'customer' AND created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate]),
    ])

    res.json({
      success: true,
      data: {
        totalCustomers: parseInt(totalCustomers.rows[0].count),
        newCustomers: parseInt(newCustomers.rows[0].count),
        topCustomers: topCustomers.rows.map(r => ({
          name: r.full_name,
          email: r.email,
          orderCount: parseInt(r.order_count),
          totalSpent: parseFloat(r.total_spent),
        })),
        growth: customerGrowth.rows.map(r => ({
          date: r.date,
          count: parseInt(r.count),
        })),
      },
    })
  } catch (err) {
    console.error('Customer analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load customer analytics' })
  }
}

export async function getBookingAnalytics(req, res) {
  try {
    const [totalBookings, statusBreakdown, eventTypes, upcomingBookings] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM event_bookings'),
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM event_bookings
        GROUP BY status
      `),
      pool.query(`
        SELECT event_type, COUNT(*) as count
        FROM event_bookings
        GROUP BY event_type
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT * FROM event_bookings
        WHERE event_date >= CURRENT_DATE
        ORDER BY event_date ASC
        LIMIT 5
      `),
    ])

    res.json({
      success: true,
      data: {
        totalBookings: parseInt(totalBookings.rows[0].count),
        statusBreakdown: statusBreakdown.rows.map(r => ({
          status: r.status,
          count: parseInt(r.count),
        })),
        eventTypes: eventTypes.rows.map(r => ({
          type: r.event_type,
          count: parseInt(r.count),
        })),
        upcomingBookings: upcomingBookings.rows,
      },
    })
  } catch (err) {
    console.error('Booking analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load booking analytics' })
  }
}

export async function getTrainingAnalytics(req, res) {
  try {
    const [trainings, registrations, popularTraining] = await Promise.all([
      pool.query(`
        SELECT t.*, 
          COALESCE(SUM(tr.number_of_students), 0) as total_registrations
        FROM trainings t
        LEFT JOIN training_registrations tr ON tr.training_id = t.id
        GROUP BY t.id
        ORDER BY t.date ASC
      `),
      pool.query(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue
        FROM training_registrations
      `),
      pool.query(`
        SELECT t.title, COUNT(tr.id) as reg_count
        FROM training_registrations tr
        JOIN trainings t ON tr.training_id = t.id
        GROUP BY t.id, t.title
        ORDER BY reg_count DESC
        LIMIT 1
      `),
    ])

    res.json({
      success: true,
      data: {
        trainings: trainings.rows.map(t => ({
          id: t.id,
          title: t.title,
          date: t.date,
          capacity: t.capacity,
          availableSpaces: t.available_spaces,
          registrations: parseInt(t.total_registrations),
          price: t.price,
        })),
        totalRegistrations: parseInt(registrations.rows[0].count),
        totalRevenue: parseFloat(registrations.rows[0].revenue),
        popularTraining: popularTraining.rows[0] || null,
      },
    })
  } catch (err) {
    console.error('Training analytics error:', err)
    res.status(500).json({ success: false, message: 'Failed to load training analytics' })
  }
}

function formatOrder(o) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    total: parseFloat(o.total),
    orderStatus: o.order_status,
    paymentStatus: o.payment_status,
    createdAt: o.created_at,
  }
}
