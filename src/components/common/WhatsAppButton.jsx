import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

const WHATSAPP_NUMBER = '2347033374470'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Bamzy!%20I%27d%20like%20to%20enquire%20about%20your%20products.`

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat bubble */}
      {open && (
        <div className="w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="bg-[#25D366] px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Chat with Bamzy</p>
                <p className="text-[11px] opacity-90">Usually replies within minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="bg-[#ECE5DD] px-4 py-3">
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
              Hi there! 👋 How can we help you today?
            </div>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#25D366] py-3 text-center text-sm font-semibold text-white hover:bg-[#20BD5A] transition-colors"
          >
            Open WhatsApp
          </a>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        {open ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>
    </div>
  )
}
