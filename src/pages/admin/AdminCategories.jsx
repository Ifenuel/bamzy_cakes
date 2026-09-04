import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Tags, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory, apiGetProducts } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'

export default function AdminCategories() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ label: '', slug: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGetCategories(), apiGetProducts()]).then(([cats, prods]) => {
      setCategories(cats || [])
      setProducts(prods || [])
      setIsLoading(false)
    })
  }, [])

  function getProductCount(catSlug) {
    return products.filter((p) => p.category === catSlug).length
  }

  function openCreate() {
    setEditing(null)
    setForm({ label: '', slug: '' })
    setShowForm(true)
  }

  function openEdit(cat) {
    setEditing(cat.id)
    setForm({ label: cat.label, slug: cat.slug })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({
      ...p,
      [name]: value,
      ...(name === 'label' && !editing ? { slug: value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim()) {
      showToast('Category name is required', 'error')
      return
    }
    try {
      if (editing) {
        await apiUpdateCategory(editing, { label: form.label.trim() })
        showToast('Category updated!', 'success')
      } else {
        await apiCreateCategory({ label: form.label.trim(), slug: form.slug })
        showToast('Category created!', 'success')
      }
      closeForm()
      apiGetCategories().then(setCategories)
    } catch (err) {
      showToast(err.message || 'Failed', 'error')
    }
  }

  async function handleDelete(cat) {
    try {
      await apiDeleteCategory(cat.id)
      showToast('Category deleted.', 'info')
      setDeleteConfirm(null)
      apiGetCategories().then(setCategories)
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error')
      setDeleteConfirm(null)
    }
  }

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading categories...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage product categories. New categories appear on the customer website automatically.</p>
        </div>
        <button onClick={openCreate}
          className="flex shrink-0 items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Categories', value: categories.length, gradient: 'from-lilac/20 to-pink/10' },
          { label: 'With Products', value: categories.filter(c => getProductCount(c.slug) > 0).length, gradient: 'from-green-50 to-emerald-50' },
          { label: 'Total Products', value: products.length, gradient: 'from-pink-50 to-rose-50' },
        ].map(({ label, value, gradient }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl bg-gradient-to-br ${gradient} border border-lilac-soft/50 p-4 text-center`}>
            <p className="text-2xl font-bold text-ink">{value}</p>
            <p className="text-[11px] font-medium text-ink-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 rounded-xl border border-lilac-soft bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft text-pink">
              <Tags size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{cat.label}</p>
              <p className="text-xs text-ink-muted">Slug: {cat.slug} &middot; {getProductCount(cat.slug)} products</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(cat)} className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-lilac-soft hover:text-pink" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => setDeleteConfirm(cat)} className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {categories.length === 0 && (
          <div className="py-16 text-center">
            <Tags size={40} className="mx-auto text-ink-muted/30" />
            <p className="mt-3 text-sm text-ink-muted">No categories yet. Add your first category!</p>
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
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">Delete Category?</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Are you sure you want to delete <strong>{deleteConfirm.label}</strong>?
                  {getProductCount(deleteConfirm.slug) > 0 && (
                    <span className="mt-1 block text-red-500 font-medium">
                      This category has {getProductCount(deleteConfirm.slug)} product(s). Move or delete them first.
                    </span>
                  )}
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-full border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} disabled={getProductCount(deleteConfirm.slug) > 0}
                    className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={closeForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-lilac-soft px-6 py-4">
                <h2 className="font-heading text-lg font-semibold">{editing ? 'Edit Category' : 'Add New Category'}</h2>
                <button onClick={closeForm} className="rounded-full p-1.5 transition-colors hover:bg-lilac-soft"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Category Name *</label>
                  <input name="label" value={form.label} onChange={handleChange} placeholder="e.g. Tiger Nuts"
                    className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
                </div>
                {!editing && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">URL Slug</label>
                    <input name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated"
                      className="w-full rounded-xl border border-lilac-soft bg-gray-50 px-4 py-2.5 text-sm text-ink-muted focus:border-lilac focus:outline-none" readOnly />
                    <p className="mt-1 text-xs text-ink-muted">Auto-generated from the category name.</p>
                  </div>
                )}
                <button type="submit"
                  className="w-full rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow">
                  {editing ? 'Save Changes' : 'Create Category'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
