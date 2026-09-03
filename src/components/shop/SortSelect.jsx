import { ChevronDown } from 'lucide-react'

/**
 * Styled sort dropdown. Controlled — parent owns `value` and handles `onChange`.
 */
export default function SortSelect({ options, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-lilac-soft bg-white px-4 py-2 pr-9 text-sm font-medium text-ink transition-colors hover:border-lilac focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  )
}