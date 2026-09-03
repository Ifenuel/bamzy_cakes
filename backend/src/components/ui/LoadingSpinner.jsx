export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`} role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-lilac-soft border-t-pink" />
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  )
}