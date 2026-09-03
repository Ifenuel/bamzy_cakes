import * as bookingService from '../services/bookingService.js'
import { success, created, error, notFound } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'
import { sanitizeObject } from '../utils/sanitize.js'

export async function createBooking(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const booking = await bookingService.createBooking({
      ...sanitized,
      customer_id: req.user?.id || null,
    })
    return created(res, booking)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getBooking(req, res) {
  try {
    const booking = await bookingService.getBookingById(req.params.id)
    if (!booking) return notFound(res, 'Booking not found')
    return success(res, booking)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getAllBookings(req, res) {
  try {
    const bookings = await bookingService.getAllBookings(req.query)
    return success(res, bookings)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status)
    if (!booking) return notFound(res, 'Booking not found')
    return success(res, booking)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}
