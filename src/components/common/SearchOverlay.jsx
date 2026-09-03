import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { getImgUrl } from '../../utils/api.js'

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?search=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.data || [])
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <Search size={20} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for cakes, pastries, treats..."
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/50"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-ink-muted hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-sm text-ink-muted">Searching...</div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-sm text-ink-muted">
              No products found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { navigate(`/shop/${p.id}`); onClose() }}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-lilac/5"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-lilac/10">
                    {p.primary_image ? (
                      <img src={getImgUrl(p.primary_image)} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink-muted">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted capitalize">{p.category_name || p.category || 'Product'}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-pink">
                    ₦{Number(p.price).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-sm text-ink-muted">
              Start typing to search our products...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
