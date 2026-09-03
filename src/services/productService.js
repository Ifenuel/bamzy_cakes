// ProductService — calls the real Express API.

import {
  apiGetProducts,
  apiGetProductById,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
} from '../utils/api.js'

export async function getProducts(params = {}) {
  return apiGetProducts(params)
}

export async function getProductById(id) {
  return apiGetProductById(id)
}

export async function getProductBySlug(slug) {
  const products = await apiGetProducts({ search: slug })
  return products.find(p => p.slug === slug) || null
}

export async function getProductsAvailableToday() {
  return apiGetProducts({ availableToday: 'true' })
}

export async function createProduct(product) {
  return apiCreateProduct(product)
}

export async function updateProduct(id, updates) {
  return apiUpdateProduct(id, updates)
}

export async function deleteProduct(id) {
  return apiDeleteProduct(id)
}

export async function getCategories() {
  return apiGetCategories()
}

export async function createCategory(body) {
  return apiCreateCategory(body)
}

export async function updateCategory(id, body) {
  return apiUpdateCategory(id, body)
}

export async function deleteCategory(id) {
  return apiDeleteCategory(id)
}
