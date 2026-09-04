import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, X, Upload, Image as ImageIcon, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiGetCategories, apiUploadImage, apiGetProductImages, apiUploadProductImage, apiSetPrimaryImage, apiDeleteProductImage } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

const EMPTY = { name: '', slug: '', description: '', price: '', category_id: '', stock: '', available_today: true, status: 'active', image_url: '' }

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [extraImages, setExtraImages] = useState([])
  const [uploadingExtra, setUploadingExtra] = useState(false)

  useEffect(() => {
    apiGetProducts().then(setProducts)
    apiGetCategories().then(setCategories)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category?.includes(q))
  }, [products, search])

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  }), [products])

  function openCreate() { setEditing(null); setForm({ ...EMPTY }); setShowForm(true) }
  function openEdit(p) {
    setEditing(p.id)
    const cat = categories.find(c => c.slug === p.category)
    setForm({ ...p, price: String(p.price), stock: String(p.stock), category_id: cat?.id || '', image_url: p.imageUrl || '' })
    setShowForm(true)
    // Load additional images
    apiGetProductImages(p.id).then(setExtraImages).catch(() => setExtraImages([]))
  }
  function closeForm() { setShowForm(false); setEditing(null); setExtraImages([]) }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    setUploading(true)
    try {
      const data = await apiUploadImage('products', file)
      setForm(prev => ({ ...prev, image_url: data.imageUrl }))
      showToast('Image uploaded successfully!', 'success')
    } catch {
      showToast('Upload failed. Is the backend running?', 'error')
    }
    setUploading(false)
  }

  function handleFileChange(e) {
    handleImageUpload(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    handleImageUpload(e.dataTransfer.files[0])
  }

  async function handleExtraImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    setUploadingExtra(true)
    try {
      const data = await apiUploadProductImage(editing, file)
      setExtraImages(prev => [...prev, data])
      showToast('Image uploaded!', 'success')
    } catch {
      showToast('Upload failed', 'error')
    }
    setUploadingExtra(false)
  }

  async function handleSetPrimary(imageId) {
    try {
      await apiSetPrimaryImage(editing, imageId)
      setExtraImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })))
      // Update the main form image_url too
      const img = extraImages.find(i => i.id === imageId)
      if (img) setForm(prev => ({ ...prev, image_url: img.imageUrl }))
      showToast('Primary image set!', 'success')
    } catch {
      showToast('Failed to set primary', 'error')
    }
  }

  async function handleDeleteExtraImage(imageId) {
    try {
      await apiDeleteProductImage(editing, imageId)
      setExtraImages(prev => prev.filter(img => img.id !== imageId))
      showToast('Image deleted', 'info')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price) {
      showToast('Name and price are required', 'error')
      return
    }
    const catId = form.category_id || categories.find(c => c.slug === form.category)?.id
    const payload = {
      name: form.name, description: form.description,
      price: parseInt(form.price) || 0, stock: parseInt(form.stock) || 0,
      category_id: catId, available_today: form.available_today,
      status: form.status || 'active', image_url: form.image_url || null,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }
    try {
      if (editing) { await apiUpdateProduct(editing, payload); showToast('Product updated!', 'success') }
      else { await apiCreateProduct(payload); showToast('Product created!', 'success') }
      closeForm()
      apiGetProducts().then(setProducts)
    } catch (err) { showToast(err.message || 'Failed', 'error') }
  }

  async function handleDelete(id) {
    try { await apiDeleteProduct(id); showToast('Product deleted.', 'info'); setDeleteConfirm(null); apiGetProducts().then(setProducts) }
    catch (err) { showToast(err.message || 'Failed', 'error') }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Products</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your product catalog and inventory.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-lilac-soft text-lilac-deep' },
          { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700' },
          { label: 'Low Stock', value: stats.lowStock, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red-50 text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={'rounded-xl p-3 text-center ' + color}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-10 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
        </div>
        <button onClick={openCreate}
          className="flex shrink-0 items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-lilac-soft bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
            {/* Image */}
            {p.imageUrl && !p.imageUrl.startsWith('/uploads/') ? (
              <img src={getImgUrl(p.imageUrl)} alt={p.name} className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-16 sm:w-16" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-soft to-lilac-soft sm:h-16 sm:w-16">
                <ImageIcon size={20} className="text-pink/50" />
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
              <p className="text-xs text-ink-muted capitalize">{p.category?.replace('-', ' ')}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-pink">{formatNaira(p.price)}</span>
                <span className="text-xs text-ink-muted">&middot;</span>
                <span className={'text-xs font-medium ' + (p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-yellow-600' : 'text-ink-muted')}>
                  {p.stock === 0 ? 'Out of stock' : p.stock + ' in stock'}
                </span>
              </div>
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-2">
              <span className={'hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:block ' + (p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink-muted')}>
                {p.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-lilac-soft hover:text-pink" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => setDeleteConfirm(p)} className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto text-ink-muted/30" />
            <p className="mt-3 text-sm text-ink-muted">{search ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50"><Trash2 size={20} className="text-red-500" /></div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">Delete Product?</h3>
                <p className="mt-2 text-sm text-ink-muted">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-full border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8" onClick={closeForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-lilac-soft bg-white px-6 py-4 rounded-t-2xl">
                <h2 className="font-heading text-lg font-semibold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeForm} className="rounded-full p-1.5 transition-colors hover:bg-lilac-soft"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Product Image</label>
                  {form.image_url ? (
                    <div className="relative">
                      <img src={getImgUrl(form.image_url)}
                        alt="Product" className="h-48 w-full rounded-xl object-cover" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                        className="absolute right-2 top-2 rounded-full bg-ink/60 p-1.5 text-white hover:bg-ink/80 transition-colors">
                        <X size={14} />
                      </button>
                      <label className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-white transition-colors">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                      className={'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ' + (dragActive ? 'border-pink bg-pink-soft/30' : 'border-lilac-soft hover:border-lilac')}>
                      {uploading ? (
                        <div className="text-center">
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent"></div>
                          <p className="mt-2 text-sm text-ink-muted">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac-soft">
                            <Upload size={20} className="text-lilac-deep" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-ink">Click to upload or drag and drop</p>
                          <p className="mt-1 text-xs text-ink-muted">JPG, PNG, WebP up to 5MB</p>
                          <label className="mt-3 cursor-pointer rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-glow transition-all">
                            Choose File
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Images (only when editing) */}
                {editing && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Additional Product Images</label>
                    <p className="mb-3 text-xs text-ink-muted">Upload multiple photos. Customers will see a gallery on the product page.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {extraImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={getImgUrl(img.imageUrl)} alt="" className="h-24 w-full rounded-lg object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <button type="button" onClick={() => handleSetPrimary(img.id)}
                              className={'rounded-full px-2 py-1 text-[10px] font-semibold text-white transition-colors ' + (img.isPrimary ? 'bg-green-500' : 'bg-white/80 text-ink hover:bg-white')}>
                              {img.isPrimary ? 'Primary' : 'Set Primary'}
                            </button>
                            <button type="button" onClick={() => handleDeleteExtraImage(img.id)}
                              className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600">
                              Delete
                            </button>
                          </div>
                          {img.isPrimary && <span className="absolute left-1 top-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">★</span>}
                        </div>
                      ))}
                      {/* Upload more button */}
                      <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-lilac-soft transition-colors hover:border-lilac">
                        {uploadingExtra ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink border-t-transparent"></div>
                        ) : (
                          <>
                            <Upload size={16} className="text-lilac" />
                            <span className="mt-1 text-[10px] text-ink-muted">Add</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files[0]) handleExtraImageUpload(e.target.files[0]); e.target.value = '' }} />
                      </label>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Red Velvet Cake"
                    className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the product..."
                    className="w-full resize-none rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">Price (₦) *</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} required placeholder="0"
                      className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">Stock *</label>
                    <input type="number" name="stock" value={form.stock} onChange={handleChange} required placeholder="0"
                      className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Category</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange}
                    className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                {/* Available Today Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={'relative h-6 w-11 rounded-full transition-colors ' + (form.available_today ? 'bg-brand-gradient' : 'bg-ink/20')}
                    onClick={() => setForm(prev => ({ ...prev, available_today: !prev.available_today }))}>
                    <div className={'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ' + (form.available_today ? 'translate-x-5' : 'translate-x-0.5')} />
                  </div>
                  <span className="text-sm font-medium text-ink">Available Today</span>
                </label>

                {/* Submit */}
                <button type="submit"
                  className="w-full rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow">
                  {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
