const TONES = {
  pink: 'bg-pink-soft text-pink',
  lilac: 'bg-lilac-soft text-lilac-deep',
  neutral: 'bg-ink/5 text-ink-muted',
}

export default function Badge({ children, tone = 'pink', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}