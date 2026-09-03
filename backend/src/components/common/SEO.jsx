import { useEffect } from 'react'

const SITE_NAME = 'Bamzy Cakes & Confectionery'
const DEFAULT_DESC = 'Beautifully crafted cakes, pastries, tiger nuts and delicious treats made specially for you.'

export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Cakes, Pastries & Events`

    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', description || DEFAULT_DESC)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title || SITE_NAME)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description || DEFAULT_DESC)
  }, [title, description])

  return null
}
