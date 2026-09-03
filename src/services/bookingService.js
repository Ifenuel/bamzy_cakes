// BookingService — calls the real Express API.

import { apiCreateBooking, apiGetBookingById, apiGetAllBookings, apiUpdateBookingStatus } from '../utils/api.js'

export async function getEventBookings() {
  return apiGetAllBookings()
}

export async function getEventBookingById(id) {
  return apiGetBookingById(id)
}

export async function createEventBooking(bookingPayload) {
  return apiCreateBooking(bookingPayload)
}

export async function updateBookingStatus(bookingId, status) {
  return apiUpdateBookingStatus(bookingId, status)
}
