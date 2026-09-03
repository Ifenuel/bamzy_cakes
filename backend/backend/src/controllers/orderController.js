import * as orderService from '../services/orderService.js'
import { success, created, error, notFound, forbidden } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'

export async function createOrder(req, res) {
  try {
    const orderData = { ...req.body }
    // If user is authenticated, link the order to them
    if (req.user) {
      orderData.customer_id = req.user.id
    }
    const order = await orderService.createOrder(orderData)
    return created(res, order)
  } catch (err) {
    console.error('Create order error:', err.message)
    return safeError(res, err, 'Order could not be created. Please check your details and try again.', 400)
  }
}

export async function getOrder(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id)
    if (!order) return notFound(res, 'Order not found')
    // Admin can view any order
    if (req.user && req.user.role === 'admin') {
      return success(res, order)
    }
    // Logged-in user can only view their own order
    if (req.user && order.customerId === req.user.id) {
      return success(res, order)
    }
    // Guest: allow access if they provide matching email
    const email = req.query.email || req.headers['x-order-email']
    if (email && order.customerEmail && email.toLowerCase() === order.customerEmail.toLowerCase()) {
      return success(res, order)
    }
    return forbidden(res, 'Access denied')
  } catch (err) {
    return safeError(res, err, 'Failed to load order', 500)
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await orderService.getCustomerOrders(req.user.id)
    return success(res, orders)
  } catch (err) {
    return safeError(res, err, 'Failed to load orders', 500)
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await orderService.getAllOrders(req.query)
    return success(res, orders)
  } catch (err) {
    return safeError(res, err, 'Failed to load admin orders', 500)
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.order_status)
    if (!order) return notFound(res, 'Order not found')
    return success(res, order)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}
