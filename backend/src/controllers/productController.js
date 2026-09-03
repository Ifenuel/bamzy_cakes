import * as productService from '../services/productService.js'
import { success, created, error, notFound } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'
import { sanitizeObject } from '../utils/sanitize.js'

export async function getProducts(req, res) {
  try {
    const products = await productService.getProducts(req.query)
    return success(res, products)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getProduct(req, res) {
  try {
    const product = await productService.getProductById(req.params.id)
    if (!product) return notFound(res, 'Product not found')
    return success(res, product)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getProductBySlug(req, res) {
  try {
    const product = await productService.getProductBySlug(req.params.slug)
    if (!product) return notFound(res, 'Product not found')
    return success(res, product)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function createProduct(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const product = await productService.createProduct(sanitized)
    return created(res, product)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateProduct(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const product = await productService.updateProduct(req.params.id, sanitized)
    if (!product) return notFound(res, 'Product not found')
    return success(res, product)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id)
    return success(res, { message: 'Product deleted' })
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getCategories(_req, res) {
  try {
    const categories = await productService.getCategories()
    return success(res, categories)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function createCategory(req, res) {
  try {
    const { slug, label } = req.body
    if (!label || !label.trim()) return error(res, 'Category name is required', 400)
    const category = await productService.createCategory({
      slug: slug || label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      label: label.trim()
    })
    return created(res, category)
  } catch (err) {
    if (err.code === '23505') return error(res, 'A category with this name already exists', 409)
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await productService.updateCategory(req.params.id, req.body)
    if (!category) return notFound(res, 'Category not found')
    return success(res, category)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function deleteCategory(req, res) {
  try {
    await productService.deleteCategory(req.params.id)
    return success(res, { message: 'Category deleted' })
  } catch (err) {
    return error(res, err.message, 400)
  }
}
