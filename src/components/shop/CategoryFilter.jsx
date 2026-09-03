/**
 * Horizontal row of category filter pills.
 * Controlled component — the parent owns activeSlug and handles onSelect.
 */
export default function CategoryFilter({ categories, activeSlug, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug
        return (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              isActive
                ? 'bg-brand-gradient text-white shadow-card'
                : 'bg-lilac-soft text-lilac-deep hover:bg-pink-soft'
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}