// OrderService — calls the real Express API.

import { apiCreateOrder, apiGetMyOrders, apiGetOrderById, apiGetAllOrders, apiUpdateOrderStatus } from '../utils/api.js'

export async function getOrders() {
  return apiGetMyOrders()
}

export async function getOrderById(orderId, email) {
  return apiGetOrderById(orderId, email)
}

export async function createOrder(orderPayload) {
  return apiCreateOrder(orderPayload)
}

export async function updateOrderStatus(orderId, orderStatus) {
  return apiUpdateOrderStatus(orderId, orderStatus)
}

export async function getAllOrders(params = {}) {
  return apiGetAllOrders(params)
}
