import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const TONES = {
  success: 'border-lilac-soft text-lilac-deep',
  error: 'border-pink-soft text-pink',
  info: 'border-lilac-soft text-ink',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] ?? Info
            return (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className={`flex items-start gap-2 rounded-xl2 border bg-white px-4 py-3 shadow-card ${TONES[toast.type]}`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm text-ink">{toast.message}</p>
                <button
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-ink-muted hover:text-ink"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}