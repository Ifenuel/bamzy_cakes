import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import useBodyScrollLock from '../../hooks/useBodyScrollLock.js'

export default function Modal({ isOpen, onClose, title, children }) {
  // Lock the background page while open (iOS-safe) so touch scrolling only
  // scrolls the modal content — never the page behind it.
  useBodyScrollLock(isOpen)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl3 bg-white p-6 shadow-card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-full p-1 text-ink-muted hover:bg-lilac-soft"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}