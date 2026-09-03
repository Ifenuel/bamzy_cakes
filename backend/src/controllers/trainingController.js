import * as trainingService from '../services/trainingService.js'
import { success, created, error, notFound } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'
import { sanitizeObject } from '../utils/sanitize.js'

export async function getTrainings(req, res) {
  try {
    const trainings = await trainingService.getTrainings(req.query)
    return success(res, trainings)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getTraining(req, res) {
  try {
    const training = await trainingService.getTrainingById(req.params.id)
    if (!training) return notFound(res, 'Training not found')
    return success(res, training)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function createTraining(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const training = await trainingService.createTraining(sanitized)
    return created(res, training)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateTraining(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const training = await trainingService.updateTraining(req.params.id, sanitized)
    if (!training) return notFound(res, 'Training not found')
    return success(res, training)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function deleteTraining(req, res) {
  try {
    await trainingService.deleteTraining(req.params.id)
    return success(res, { message: 'Training deleted' })
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function registerForTraining(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const registration = await trainingService.registerForTraining(req.params.id, {
      ...sanitized,
      customer_id: req.user?.id || null,
    })
    return created(res, registration)
  } catch (err) {
    return error(res, err.message, 400)
  }
}
