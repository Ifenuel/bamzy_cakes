import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import useBodyScrollLock from '../../hooks/useBodyScrollLock.js'

/**
 * iOS-safe modal sheet used by all admin editors.
 *
 * Why this structure (the old per-page modals stopped scrolling on iPhone):
 * - The BACKDROP is a fixed, non-scrolling flex-column layer. It never scrolls,
 *   so touch-panning can only ever target the card below it.
 * - The CARD is a flex-column sheet capped at h/dvh. Only ONE inner element
 *   scrolls (the body), so iOS Safari can't get confused about which layer
 *   should pan. Header + footer stay pinned (sticky) above/below it.
 * - z-[60] sits above the WhatsApp float button and sidebar overlays (z-50),
 *   so the floating bubble can't paint over the Save button or steal touches.
 * - 100dvh with a vh fallback (@supports block in index.css) so older iOS
 *   Safari (< 15.4, no dvh support) still gets a correct max height.
 */
export default function ModalSheet({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  useBodyScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex flex-col items-center bg-ink/40 px-3 py-3 sm:px-4 sm:py-6"
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[92dvh] ${maxWidth}`}
          >
            {/* Pinned header */}
            <div className="flex shrink-0 items-center justify-between border-b border-lilac-soft bg-white px-6 py-4">
              <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 transition-colors hover:bg-lilac-soft"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* The ONLY scroll container */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
              {children}
            </div>

            {/* Pinned footer (optional) */}
            {footer && (
              <div className="shrink-0 border-t border-lilac-soft bg-white px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
