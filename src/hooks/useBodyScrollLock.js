import { useEffect } from 'react'

/**
 * Locks body scrolling while `locked` is true — for modals/drawers.
 *
 * Why not just `document.body.style.overflow = 'hidden'`?
 * iOS Safari ignores overflow:hidden on the body. The reliable approach is to
 * freeze the body in place with position:fixed at the current scroll offset,
 * then restore it on unlock. This stops the "background scrolls behind the
 * modal" bug on iPhone/Android while keeping the modal's own scroll context.
 */
export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined

    const scrollY = window.scrollY
    const { overflow, position, top, width } = document.body.style
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth

    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${scrollY}px`,
      left: '0',
      right: '0',
      width: '100%',
      overflow: 'hidden',
      // compensate scrollbar removal so content doesn't jump sideways
      paddingRight: scrollbarGap > 0 ? `${scrollbarGap}px` : '',
    })

    return () => {
      Object.assign(document.body.style, { position, overflow, top, width, paddingRight: '' })
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
