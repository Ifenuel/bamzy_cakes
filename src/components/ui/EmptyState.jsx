export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 bg-lilac-soft/50 px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-pink shadow-soft">
          <Icon size={26} />
        </span>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}