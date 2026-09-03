import { ImageIcon } from 'lucide-react'

/**
 * Polished stand-in for real product/lifestyle photography. Drop a real
 * `src` in later and this can be swapped for an <img> without touching
 * any layout code that renders it.
 */
export default function ImagePlaceholder({ label, className = '', iconSize = 28 }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-brand-gradient-soft text-lilac-deep ${className}`}
    >
      <ImageIcon size={iconSize} strokeWidth={1.5} />
      {label && <span className="px-2 text-center text-xs font-medium text-lilac-deep/80">{label}</span>}
    </div>
  )
}