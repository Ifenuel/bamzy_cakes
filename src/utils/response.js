export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  })
}

export function created(res, data) {
  return success(res, data, 201)
}

export function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

export function notFound(res, message = 'Resource not found') {
  return error(res, message, 404)
}

export function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401)
}

export function forbidden(res, message = 'Forbidden') {
  return error(res, message, 403)
}

export function serverError(res, message = 'Internal server error') {
  return error(res, message, 500)
}
