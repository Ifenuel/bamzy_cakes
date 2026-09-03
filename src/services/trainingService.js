// TrainingService — calls the real Express API.

import { apiGetTrainings, apiGetTrainingById, apiCreateTraining, apiUpdateTraining, apiDeleteTraining, apiRegisterForTraining } from '../utils/api.js'

export async function getTrainings() {
  return apiGetTrainings()
}

export async function getTrainingById(trainingId) {
  return apiGetTrainingById(trainingId)
}

export async function createTraining(training) {
  return apiCreateTraining(training)
}

export async function updateTraining(id, updates) {
  return apiUpdateTraining(id, updates)
}

export async function deleteTraining(id) {
  return apiDeleteTraining(id)
}

export async function registerForTraining(trainingId, registration) {
  return apiRegisterForTraining(trainingId, registration)
}
