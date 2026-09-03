import * as paymentService from '../services/paymentService.js'
import { success, error, notFound } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'

export async function initializePayment(req, res) {
  try {
    const result = await paymentService.initializePayment(req.body)
    return success(res, result)
  } catch (err) {
    return safeError(res, err, 'Payment initialization failed', 400)
  }
}

export async function verifyPayment(req, res) {
  try {
    const result = await paymentService.verifyPayment(req.params.reference)
    return success(res, result)
  } catch (err) {
    return safeError(res, err, 'Payment verification failed', 400)
  }
}

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-paystack-signature']
    await paymentService.handleWebhook(req.body, signature)
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return res.status(400).json({ error: 'Webhook processing failed' })
  }
}

export async function getPayments(req, res) {
  try {
    const payments = await paymentService.getPayments(req.query)
    return success(res, payments)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const payment = await paymentService.getPaymentByReference(req.params.reference)
    if (!payment) return notFound(res, 'Payment not found')
    return success(res, payment)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}
