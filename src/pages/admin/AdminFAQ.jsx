import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '../../components/ui/Toast.jsx'
import { apiGetSettings, apiUpdateSettings } from '../../utils/api.js'

const DEFAULT_CATEGORIES = [
  {
    title: 'Orders',
    items: [
      { q: 'How do I place an order?', a: 'Browse our Shop Today page, select your treats, add them to your basket, and proceed to checkout.' },
    ],
  },
]

export default function AdminFAQ() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedCat, setExpandedCat] = useState(0)

  useEffect(() => {
    apiGetSettings().then((settings) => {
      if (Array.isArray(settings?.faq_categories) && settings.faq_categories.length > 0) {
        setCategories(settings.faq_categories)
      }
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  function addCategory() {
    setCategories(prev => [...prev, { title: 'New Category', items: [{ q: '', a: '' }] }])
    setExpandedCat(categories.length)
  }

  function removeCategory(index) {
    setCategories(prev => prev.filter((_, i) => i !== index))
  }

  function updateCategoryTitle(index, title) {
    const updated = [...categories]
    updated[index] = { ...updated[index], title }
    setCategories(updated)
  }

  function addQuestion(catIndex) {
    const updated = [...categories]
    updated[catIndex].items = [...updated[catIndex].items, { q: '', a: '' }]
    setCategories(updated)
  }

  function removeQuestion(catIndex, qIndex) {
    const updated = [...categories]
    updated[catIndex].items = updated[catIndex].items.filter((_, i) => i !== qIndex)
    setCategories(updated)
  }

  function updateQuestion(catIndex, qIndex, field, value) {
    const updated = [...categories]
    updated[catIndex].items[qIndex] = { ...updated[catIndex].items[qIndex], [field]: value }
    setCategories(updated)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await apiUpdateSettings({ faq_categories: categories })
      showToast('FAQ saved to database!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error')
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <div className="py-20 text-center text-ink-muted">Loading FAQ...</div>
  }

  const ic = 'w-full rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'
  const tc = 'w-full resize-none rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">FAQ Management</h1>
          <p className="text-sm text-ink-muted">Manage the Frequently Asked Questions on the customer website.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addCategory}
            className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lilac-soft">
            <Plus size={16} /> Add Category
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:opacity-50">
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save FAQ'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat, ci) => (
          <div key={ci} className="rounded-xl border border-lilac-soft bg-white shadow-soft overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-3 border-b border-lilac-soft/60 bg-lilac-soft/30 px-4 py-3">
              <button onClick={() => setExpandedCat(expandedCat === ci ? -1 : ci)}
                className="text-ink-muted hover:text-ink transition-colors">
                {expandedCat === ci ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <input value={cat.title} onChange={(e) => updateCategoryTitle(ci, e.target.value)}
                className="flex-1 bg-transparent font-heading text-lg font-semibold text-ink focus:outline-none"
                placeholder="Category title" />
              {categories.length > 1 && (
                <button onClick={() => removeCategory(ci)} className="text-pink hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Questions */}
            {expandedCat === ci && (
              <div className="p-4 space-y-3">
                {cat.items.map((item, qi) => (
                  <div key={qi} className="rounded-lg border border-lilac-soft/60 bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-ink-muted uppercase">Question {qi + 1}</span>
                      {cat.items.length > 1 && (
                        <button onClick={() => removeQuestion(ci, qi)} className="text-pink hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input value={item.q} onChange={(e) => updateQuestion(ci, qi, 'q', e.target.value)}
                      className={ic} placeholder="Question..." />
                    <textarea value={item.a} onChange={(e) => updateQuestion(ci, qi, 'a', e.target.value)}
                      rows={3} className={tc} placeholder="Answer..." />
                  </div>
                ))}
                <button onClick={() => addQuestion(ci)}
                  className="flex items-center gap-1 rounded-lg bg-pink-soft px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors">
                  <Plus size={14} /> Add Question
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
